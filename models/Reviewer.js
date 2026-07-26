const mongoose=require("mongoose")
const Schema=mongoose.Schema

const ReviewerSchema=new Schema({
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User",
	},
	reviewerId:{
		type:String,
		required:true,
	},
	department:{
		type:String,
		required:true
	},
	status:{
		type:String,
		enum:["DRAFT","UNDER_REVIEW","APPROVED"],
		default:"DRAFT"
	},
	maxAssignments:{
    	type: Number,
    	default: 5,
		min:1,
		max:10
	},
	availability:{
    	type: String,
    	enum: ["AVAILABLE", "BUSY", "INACTIVE"],
    	default: "AVAILABLE"
	},
	lastLogin:{
		type:Date,
		default:Date.now
	}
})

const Reviewer=mongoose.model("Reviewer",ReviewerSchema)

module.exports=Reviewer







