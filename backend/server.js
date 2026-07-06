import 'dotenv/config'
import app from './index.js'
import { ConnectDb } from './Db/mongoConnection.js'
// import { client } from './controllers/whatsappBot.js'
const PORT=3000

ConnectDb(process.env.MONGO_URI)

app.listen(PORT,()=>{
     console.log(`the server is runnning at port ${PORT}`)
     console.log("whatsapp bot bhi chalu ho rha bss")
     // client.initialize()
})
