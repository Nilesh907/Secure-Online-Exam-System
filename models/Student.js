const mongoose=require("mongoose")
const Schema=mongoose.Schema

const StudentSchema=new Schema({
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},
	enrollmentNumber:{
		type:String,
		unique:true,
		required:true,
	},
	department:{
		type:String,
		required:true,
	},
	semester:{
		type:Number,
		required:true,
		min:1,
		max:8
	},
	suspiciousActivityCount:{
		type:Number,
		default: 0
	},
	isBlocked:{
		type:Boolean,
		default:false,
	},
	lastLogin:{
		type:Date,
		default:Date.now
	}
})

const Student=mongoose.model("Student",StudentSchema)

module.exports=Student








