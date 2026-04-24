import { Button } from "../components/ui/button";

export default function Login() {
  return (
    <div className="text-2xl font-bold min-h-screen text-blue-">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-200 -translate-x-1/2 rounded-full bg-linear-to-r from-indigo-200/40 via-sky-200/35 to-emerald-200/30 blur-3xl" />
        <div className="absolute top-48 left-10 h-56 w-56 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute bottom-16 right-10 h-56 w-56 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] bg-size-[24px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400">

                    </span>
                    Agentic Support Desk
                </div>
                <h1 className="text-5xl font-semibold  text-slate-900 gap-y-4">
                  Triage Tickets. Draft replies.
                <span className="block text-slate-700 py-6">Save runs for audit and reuse.</span>
                </h1>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">
                    Structured Output
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Category, reply and next actions
                  </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">
                    Quick Responses
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Choose any model
                  </div>
                  </div>
                </div>
             </div>
                  <div className="lg:justify-self-end">
                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-6 backdrop-blur shadow-2xl">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-2xl font-semibold text-slate-900 ">
                        Continue to Agent
                      </div>
                    </div>
                    <div className=" p-3 space-y-3">
                      <Button
                      data-testid="login-btn"
                      className="w-full bg-black text-white cursor-pointer">Login</Button>
                    </div>
                    </div>
                  </div>
        </div>
      </div>
    </div>
  );
}
