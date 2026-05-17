import { Router } from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Provider } from "./support.schema";
import { DraftSchema } from "./support.schema";
import { RequestSchema } from "./support.schema";
import { TavilyResult, tavilySearch } from "./tavily";
import extractEnv from "../utils";


const router = Router();

function modelIdFor(provider: Provider) {
  return provider === "gemini" ? extractEnv("GEMINI_MODEL") : " ";
}


function makeModel(provider: Provider) {
  if (provider !== "gemini") {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  return new ChatGoogleGenerativeAI({
    model: modelIdFor(provider),
    apiKey: extractEnv("GEMINI_API_KEY"),
    json: true,
  });
}

function messageContentToString(content: unknown) {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }
        return "";
      })
      .join("");
  }

  return "";
}

function shouldWebSearch(ticket: string) {
  const ticketLowerCase = ticket.toLowerCase();

  if (/\b(non-?docs?|no\s+docs?)\b/.test(ticketLowerCase)) return false;

  const technicalSignals =
    /\b(docs?|documentation|oauth|oidc|redirect_uri|callback|webhook|signature|hmac|idempotenc(y|e)|integration|sdk|api|sso|saml|okta|scim)\b/;

  return technicalSignals.test(ticketLowerCase);
}

function formatSearchResults(results: TavilyResult[]) {
  if (!results.length) return "none";

  return results
    .map((res, index) => {
      const snip = res.snippet?.trim() ? res.snippet.trim() : "no snippet";

      return `#${index + 1} ${res.title}\n${res.url}\n${snip}`;
    })
    .join("\n\n");
}

function createPrompt(args: { ticket: string; searchResults: TavilyResult[] }) {
  const hasSearchResult = args.searchResults.length > 0;

  return [
    "You are a B2B support desk agent.",
    "Write a customer-ready reply.",
    "",
    "Output ONLY strict JSON with this exact shape:",
    '{ "reply": string, "sources": string[] }',
    "",
    "Rules:",
    "- Be polite, clear, short paragraphs.",
    "- Ask for missing info if needed.",
    "- Do NOT make strong promises (no guarantees).",
    hasSearchResult
      ? "- If you used any webSearch result, sources[] MUST contain 1–3 URLs FROM the provided webSearch results."
      : "- sources[] MUST be [].",
    "",
    "webSearch results:",
    formatSearchResults(args.searchResults),
    "",
    "Ticket:",
    args.ticket,
  ].join("\n");
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function isHttpUrl(input: string) {
  try {
    const check = new URL(input);
    return check.protocol === "http:" || check.protocol === "https:";
  } catch {
    return false;
  }
}

router.post("/run", async (req, res) => {
  const parsed = RequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { provider, text } = parsed.data;
  const ticket = text.trim();

  // set some rules -> web search ? or dont ?

  const doWebSearch = shouldWebSearch(ticket);

  let searchResults: TavilyResult[] = [];

  try {
    if (doWebSearch) {
      const ticket = text.trim();
      searchResults = await tavilySearch({ query: ticket.slice(0, 200) });
    }
  } catch {
    searchResults = [];
  }

  try {
    const model = makeModel(provider);
    const prompt = createPrompt({ ticket, searchResults });

    const out = await model.invoke([
      ["system", "Return strict JSON only. No Markdown. No extra keys"],
      ["user", prompt],
    ]);

    const draft = DraftSchema.parse(JSON.parse(messageContentToString(out.content)));

    let sources = uniq(draft.sources).filter(
      (source) => typeof source === "string",
    );
    sources = sources.filter(isHttpUrl).slice(0, 3);

    if (doWebSearch && searchResults.length > 0) {
      const allowed = uniq(
        searchResults
          .map((searchRes) =>
            typeof searchRes.url === "string" ? searchRes.url.trim() : "",
          )
          .filter(Boolean),
      );

      if (sources.length === 0) {
        return res.status(422).json({
          error: "sources are empty",
        });
      }

      const badSources = sources.filter((source) => !allowed.includes(source));

      if (badSources.length > 0) {
        return res.status(422).json({
          error: "sources not allowed",
          badSources,
          allowedSources: allowed.slice(0, 3),
        });
      }

      return res.json({ reply: draft.reply, sources });
    }

    return res.json({ reply: draft.reply, sources: [] });
  } catch(e) {
    return res.status(500).json({
      error: `Source agent failed: ${(e as Error).message}`,
    });
  }
});

export default router;
