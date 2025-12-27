import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [conversationState, setConversationState] = useState({
    stage: 'initial',
    medicine: null,
    store: null,
    prescription: null,
    location: null,
    landmark: null
  })
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const welcomeMessage = `🙏 Hello & Namaste! Medigo Medical Delivery Express में आपका स्वागत है.
मैं आपकी मदद के लिए यहाँ हूँ।

You can order medicines and medical products easily —
📍 From your preferred local medical store
🕒 Fast & safe delivery
💊 100% genuine medicines

Please बताइए, आपको कौन-सी medicine चाहिए?
और क्या आप बताना चाहेंगे कि medicine किस medical store से लेनी है?
If you're not sure, I can suggest nearby medical stores.

अगर prescription है तो आप यहाँ upload कर सकते हैं.
Delivery या charges से जुड़ा कोई भी सवाल हो, बेहिचक पूछिए.

Medigo Medical Delivery Express – आपकी सेहत, हमारी ज़िम्मेदारी ❤️`

    setMessages([{ text: welcomeMessage, sender: 'bot' }])
  }, [])

  const nearbyStores = [
    "Apollo Pharmacy, Sector 12",
    "MedPlus, Main Market",
    "HealthKart Pharmacy, Downtown",
    "Wellness Forever, City Center",
    "Guardian Pharmacy, Central Plaza"
  ]

  const getResponse = (userInput) => {
    const input = userInput.toLowerCase()
    const { stage, medicine, store, prescription, location } = conversationState

    // Check for delivery time query
    if (input.includes('delivery time') || input.includes('कितना समय') || input.includes('kitna time')) {
      return "Delivery usually takes 30 to 90 minutes, depending on your location and the medical store. हम जल्दी से जल्दी आपकी medicine पहुंचाने की कोशिश करते हैं 🚀"
    }

    // Check for charges query
    if (input.includes('charge') || input.includes('price') || input.includes('cost') || input.includes('कितना लगेगा') || input.includes('kitna lagega')) {
      return "Delivery charges depend on distance, medical store, and order value. Usually ₹20 to ₹50. कुछ stores पर ₹500+ orders पर delivery free भी होती है. Final charges आपको order confirm करते समय दिख जाएंगे 💰"
    }

    // Check for human support
    if (input.includes('human') || input.includes('senior') || input.includes('manager') || input.includes('इंसान से बात')) {
      return "जी बिल्कुल! मैं आपको हमारे senior support team से connect कर देता हूँ. कृपया थोड़ा इंतज़ार करें, या आप हमें call कर सकते हैं: 1800-XXX-XXXX 📞"
    }

    // Stage-based conversation flow
    if (stage === 'initial' || !medicine) {
      if (input.includes('medicine') || input.includes('दवा') || input.includes('dawa') || input.includes('tablet') || input.includes('syrup') || input.includes('capsule')) {
        // Try to extract medicine name
        const words = userInput.split(' ')
        const possibleMedicine = words.slice(1).join(' ') || 'medicine'

        if (words.length > 1) {
          setConversationState({ ...conversationState, stage: 'got_medicine', medicine: possibleMedicine })
          return `अच्छा, तो आपको ${possibleMedicine} चाहिए. क्या आप बता सकते हैं कि किस medical store से लेना चाहेंगे?

या अगर आपको पता नहीं है तो मैं आपके nearby medical stores suggest कर सकता हूँ. बस बोलिए "nearby stores" 🏥`
        } else {
          setConversationState({ ...conversationState, stage: 'asking_medicine' })
          return "जी हाँ, बताइए कौन-सी medicine चाहिए? Medicine का नाम या product बताइए 💊"
        }
      } else if (input.length > 2) {
        // Assume they mentioned medicine name directly
        setConversationState({ ...conversationState, stage: 'got_medicine', medicine: userInput })
        return `समझ गया, आपको ${userInput} चाहिए.

अब बताइए - आप किस medical store से लेना चाहेंगे? या मैं आपके nearby stores बता दूँ? 🏥`
      }
      return "कोई बात नहीं! Please बताइए आपको कौन-सी medicine या medical product चाहिए? 💊"
    }

    if (stage === 'got_medicine' && !store) {
      if (input.includes('nearby') || input.includes('suggest') || input.includes('पास') || input.includes('paas') || input.includes('कोई भी') || input.includes('any')) {
        const storeList = nearbyStores.map((s, i) => `${i + 1}. ${s}`).join('\n')
        setConversationState({ ...conversationState, stage: 'showing_stores' })
        return `यहाँ हैं आपके nearby medical stores:\n\n${storeList}\n\nआप इनमें से किसी को select कर सकते हैं, बस number या name बता दीजिए 🏪`
      } else if (input.match(/\d/) || nearbyStores.some(s => input.includes(s.toLowerCase().split(',')[0].toLowerCase()))) {
        // User selected a store
        let selectedStore = userInput
        if (input.match(/^\d$/)) {
          const index = parseInt(input) - 1
          if (index >= 0 && index < nearbyStores.length) {
            selectedStore = nearbyStores[index]
          }
        }
        setConversationState({ ...conversationState, stage: 'got_store', store: selectedStore })
        return `Perfect! ${selectedStore} से order करेंगे.

क्या ${medicine} के लिए prescription चाहिए? अगर हाँ, तो कृपया prescription upload कीजिए. नीचे "Upload Prescription" button है 📋

या अगर prescription की ज़रूरत नहीं है, तो अपना delivery address बता दीजिए 📍`
      } else {
        setConversationState({ ...conversationState, stage: 'got_store', store: userInput })
        return `ठीक है, ${userInput} से order करेंगे 👍

क्या ${medicine} के लिए prescription चाहिए? अगर हाँ, तो कृपया prescription upload कीजिए. नीचे "Upload Prescription" button है 📋

या अगर prescription की ज़रूरत नहीं है, तो अपना delivery address बता दीजिए 📍`
      }
    }

    if (stage === 'got_store' && !location) {
      if (input.includes('uploaded') || input.includes('upload') || prescription) {
        setConversationState({ ...conversationState, stage: 'got_prescription' })
        return `धन्यवाद! Prescription received. अब कृपया अपना delivery address और कोई landmark बताइए 📍

Example: "123 Park Street, near City Hospital"`
      } else if (input.includes('no prescription') || input.includes('नहीं चाहिए') || input.includes('address')) {
        setConversationState({ ...conversationState, stage: 'asking_location' })
        return `कोई बात नहीं! अब कृपया अपना delivery address और कोई landmark बताइए 📍

Example: "123 Park Street, near City Hospital"`
      } else if (input.length > 10) {
        // Assume they provided address
        setConversationState({ ...conversationState, stage: 'got_location', location: userInput })
        return `बहुत अच्छे! आपका delivery address है: ${userInput}

✅ Medicine: ${medicine}
✅ Medical Store: ${store}
✅ Delivery Address: ${userInput}

📦 Delivery Time: 30-90 minutes
💰 Charges: Will be shown at checkout

क्या मैं इस order को confirm करूँ? बोलिए "Yes" या "Confirm" 🙌`
      }
      return `कृपया अपना delivery address और कोई landmark बताइए 📍`
    }

    if (stage === 'got_location') {
      if (input.includes('yes') || input.includes('confirm') || input.includes('हाँ') || input.includes('ok')) {
        setConversationState({ ...conversationState, stage: 'confirmed' })
        return `🎉 बहुत बढ़िया! आपका order confirm हो गया है!

Order Summary:
💊 Medicine: ${medicine}
🏥 Medical Store: ${store}
📍 Delivery Address: ${location}
⏱️ Expected Delivery: 30-90 minutes

आपको SMS और WhatsApp पर order updates मिलते रहेंगे.

Medigo Medical Delivery Express का धन्यवाद! आपकी सेहत, हमारी ज़िम्मेदारी ❤️

कुछ और मदद चाहिए तो बेझिझक पूछिए! 🙏`
      } else if (input.includes('no') || input.includes('नहीं') || input.includes('change')) {
        return `कोई बात नहीं! क्या आप कुछ change करना चाहते हैं? बताइए मैं फिर से help करता हूँ 🙏`
      }
    }

    // Default friendly response
    return `मैं समझा नहीं, कृपया फिर से बताइए या इनमें से कोई option चुनिए:
- Medicine name बताइए
- Nearby stores देखिए
- Delivery time पूछिए
- Charges के बारे में जानिए
- Human support से बात करिए

मैं यहाँ आपकी मदद के लिए हूँ! 🙏`
  }

  const handleSend = () => {
    if (input.trim() === '') return

    const userMessage = { text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])

    setTimeout(() => {
      const botResponse = getResponse(input)
      const botMessage = { text: botResponse, sender: 'bot' }
      setMessages(prev => [...prev, botMessage])
    }, 500)

    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setConversationState({ ...conversationState, prescription: file.name })
      const uploadMessage = { text: `📋 Prescription uploaded: ${file.name}`, sender: 'user' }
      setMessages(prev => [...prev, uploadMessage])

      setTimeout(() => {
        const botResponse = `धन्यवाद! Prescription received (${file.name}).

अब कृपया अपना delivery address और कोई landmark बताइए 📍

Example: "123 Park Street, near City Hospital"`
        const botMessage = { text: botResponse, sender: 'bot' }
        setMessages(prev => [...prev, botMessage])
        setConversationState({ ...conversationState, stage: 'asking_location', prescription: file.name })
      }, 500)
    }
  }

  return (
    <>
      <Head>
        <title>Medigo Medical Delivery Express - मेडिगो मेडिकल डिलीवरी</title>
        <meta name="description" content="Fast and trusted medical delivery service" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💊</text></svg>" />
      </Head>

      <div className="container">
        <header className="header">
          <h1>💊 Medigo Medical Delivery Express</h1>
          <p>आपकी सेहत, हमारी ज़िम्मेदारी</p>
        </header>

        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              style={{ display: 'none' }}
            />
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Prescription"
            >
              📋
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... अपना message लिखिए..."
              className="input"
            />
            <button onClick={handleSend} className="send-btn">
              Send ➤
            </button>
          </div>
        </div>

        <footer className="footer">
          <p>🚀 Fast Delivery | 💯 Genuine Medicines | 🔒 Safe & Secure</p>
        </footer>
      </div>
    </>
  )
}
