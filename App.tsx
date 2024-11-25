import { useState } from "react"
import { ItemSuggestion } from "./components/ItemSeggestion"
import { getHistoric, setHistoric } from "./storage/historic"
import { sendMessage } from "./api/openai"
import { ThreeDots } from "react-loader-spinner"

type ProgressType = 'pending' | 'started' | 'done'

type Message = {
  role: 'user' | 'assistant'
  content: string
  subject?: string
}

function App() {
  const [progress, setProgress] = useState<ProgressType>('pending')
  const [textarea, setTextarea] = useState<string>('')
  const [chat, setChat] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  function resetChat() {
    setProgress('pending')
    setChat([])
  }

  async function handleSubmitChat() {
    if (!textarea) {
      return
    }

    const message = textarea
    setTextarea('')

    if (progress === 'pending') {
      setHistoric(message)
      setProgress('started')

      const prompt = `Gere uma pergunta onde simule uma entrevista de 
      emprego sobre ${message}. Após gerar a pergunta, 
      enviarei a resposta e você me dará um feedback. 
      O feedback precisa ser simples e objetivo e corresponder fielmente à resposta enviada.
      Após o feedback, não existirá mais interação.`

      const messageGPT: Message = {
        role: 'user',
        content: prompt,
        subject: message
      }

      // Atualiza o chat com a mensagem do usuário
      setChat(text => [...text, messageGPT])
      
      // Começa a exibir o carregamento
      setLoading(true)

      try {
        const questionGPT = await sendMessage([messageGPT])
        console.log("Resposta da API:", questionGPT) // Verificar se a resposta está correta

        setChat(text => [...text, { role: 'assistant', content: questionGPT.content }])
      } catch (error) {
        console.error("Erro ao obter a resposta da IA:", error)
        setChat(text => [...text, { role: 'assistant', content: 'Desculpe, algo deu errado ao tentar obter a resposta.' }])
      } finally {
        setLoading(false)
      }

      return
    }

    // Se a interação já começou (progress === 'started')
    const responseUser: Message = {
      role: 'user',
      content: message
    }

    setChat(text => [...text, responseUser])
    
    setLoading(true)

    try {
      const feedbackGPT = await sendMessage([...chat, responseUser])
      console.log("Feedback da API:", feedbackGPT)

      setChat(text => [...text, { role: 'assistant', content: feedbackGPT.content }])
      setProgress('done')
    } catch (error) {
      console.error("Erro ao obter o feedback da IA:", error)
      setChat(text => [...text, { role: 'assistant', content: 'Desculpe, algo deu errado ao tentar obter o feedback.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="sidebar">
        <details open className="suggestion">
          <summary>Tópicos Sugeridos</summary>
          <ItemSuggestion title="HTML" onClick={() => setTextarea('HTML')}/>
          <ItemSuggestion title="CSS" onClick={() => setTextarea('CSS')}/>
          <ItemSuggestion title="JavaScript" onClick={() => setTextarea('JavaScript')}/>
          <ItemSuggestion title="TypeScript" onClick={() => setTextarea('TypeScript')}/>
        </details>

        <details open className="historic">
          <summary>Histórico</summary>
          {
            getHistoric().map(item => (
              <ItemSuggestion key={item} title={item} onClick={() => setTextarea(item)}/>
            ))
          }
        </details>
      </div>

      <div className="content">
        {progress === 'pending' && (
          <div className="box-home">
            <span>Olá, eu sou o</span>
            <h1>teach<span>.me</span></h1>
            <p>
              Estou aqui para te ajudar nos seus estudos.
              Selecione um dos tópicos sugeridos ao lado
              ou digite um tópico que deseja estudar para
              começarmos
            </p>
          </div>
        )}

        {progress !== 'pending' && (
          <div className="box-chat">
            {chat[0] && (
              <h1>Você está estudando sobre <span>{chat[0].subject}</span></h1>
            )}

            {chat[1] && (
              <div className="question">
                <h2> <img src="assets/question.svg" alt=""/>Pergunta</h2>
                <p>{chat[1].content}</p>
              </div>
            )}

            {chat[2] && (
              <div className="answer">
                <h2>Sua Resposta</h2>
                <p>{chat[2].content}</p>
              </div>
            )}

            {chat[3] && (
              <div className="feedback">
                <h2>Feedback teach<span>.me</span></h2>
                <p>{chat[3].content}</p>
                <div className="actions">
                  <button onClick={resetChat}>Estudar novo tópico</button>
                </div>
              </div>
            )}

            {loading && (
              <ThreeDots 
                visible={true}
                height="30"
                width="60"
                color="#d6409f"
                radius="9"
                ariaLabel="three-dots-loading"
                wrapperStyle={{ margin: '30px auto' }}
              />
            )}
          </div>
        )}

        {progress !== 'done' && (
          <div className="box-input">
            <textarea 
              value={textarea}
              onChange={element => setTextarea(element.target.value)}
              placeholder={
                progress === 'started' ? "Insira sua resposta..." : "Insira o tema que deseja estudar..."
              }
            />
            <button onClick={handleSubmitChat}>
              {progress === 'pending' ? 'Enviar Pergunta' : 'Enviar Resposta'}
            </button>
          </div>
        )}

        <footer className="box-footer">
          <p>teach<span>.me</span></p>
        </footer>
      </div>
    </div>
  )
}

export default App
