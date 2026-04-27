const extractEnv = (key:string)=>{
    const value = process.env[key];
    if(!value){
        throw new Error(`Empty environment variable: ${key}`);
    }
    return value;
}

export default extractEnv;