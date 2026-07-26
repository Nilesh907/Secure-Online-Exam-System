const mongoose=require("mongoose")
const Schema=mongoose.Schema

const HistorySchema=new Schema({
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},
	device:{
		type:String
	},
	loginTime:{
		type:Date,
		default:Date.now
	},
	logoutTime:{
		type:Date
	}

})

const History=mongoose.model("History",HistorySchema)

module.exports=History