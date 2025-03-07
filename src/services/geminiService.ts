


const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN);

export async function getAI({ prompt }: { prompt: string }): Promise<string> {
    console.log('gerando IA...')
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('IA obtida: ', text)
    return text;
}

