
import OpenAI from "openai"

type Message = {
	role: 'user' | 'assistant'
	content: string
}

const openai = new OpenAI({
	apiKey: 'sk-37xRLMAO9H6nWCJrEd0zNDS1Bs_ihZ2DI9xfD631jOT3BlbkFJwi3RgTwhVvqpWR5cijw8mQiTr4xB-OdsAtD-j5jyYA',
	dangerouslyAllowBrowser: true
})

export async function sendMessage(messages: Message[]) {
	const response = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo',
		messages: messages.map(message => (
			{ role: message.role, content: message.content }
		))
	})

	return {
		role: response.choices[0].message.role,
		content: response.choices[0].message.content || ''
	}
}