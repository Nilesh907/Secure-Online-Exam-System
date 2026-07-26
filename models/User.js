const mongoose=require("mongoose")
const Schema=mongoose.Schema;

const UserSchema=new Schema({
	name:String,
	email:{
		type:String,
		unique:true,
		required:true,
	},
	password:{
		type:String,
		required:true,
		minlength: 8,
  match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/
	},
	role:{
		type:String,
		enum:["Admin","Teacher","Reviewer","Student"],
		required:true
	},
	isActive:{
		type:Boolean,
		default:true
	},
	loginAttempts:{
	type:Number,
	default:0
	},

	lockUntil:{
	type:Date
	},

	lastLogin:{
		type:Date,
		default:Date.now
	}
})

const User=mongoose.model("User",UserSchema)

module.exports=User













































