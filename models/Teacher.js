const mongoose=require("mongoose")
const Schema=mongoose.Schema

const TeacherSchema=new Schema({
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},
	teacherId:{
		type:String,
		required:true,
		unique:true
	},
	department:{
		type:String,
		required:true
	},
	designation:{
		type:String,
		required:true
	},
	qualification:{
		type:String,
		required:true
	},
	experienceYears:{
		type:Number,
		default:0,
	},
})

const Teacher=mongoose.model("Teacher",TeacherSchema)

module.exports=Teacher







