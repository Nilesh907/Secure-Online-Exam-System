const User=require("../models/User")
const bcrypt = require("bcrypt");


module.exports.index=async(req,res)=>{
	try{
		const users=await User.find()
		res.render("user/index.ejs",{users})
	}catch(err){
		console.log("err in user index route")
	}
}


module.exports.newForm=async(req,res)=>{
	try{
		res.render("user/new.ejs")
	}catch(err){
		console.log("err fetching in new form")
	}
}

module.exports.createUser=async(req,res)=>{
	try{
		const user=new User(req.body.user)
		await user.save()
		res.redirect(`/users/${user._id}`)
	}catch(err){
		console.log("err fetching in create user")
	}
}
module.exports.showUser=async(req,res)=>{
	try{
		const user=await User.findById(req.params.id)
		res.render("user/show.ejs",{user})
	}catch(err){
		console.log("err fetching in show user",err)
	}
}
module.exports.editForm=async(req,res)=>{
	try{
		const {id}=req.params
		const user=await User.findById(id)
		res.render("user/edit.ejs",{user})
	}catch(err){
		console.log("err fetching in edit",err)
	}
}

module.exports.updateUser = async (req,res)=>{

		try{

		const {id} = req.params;

		const {name,email,role,isActive,currentPassword,newPassword,confirmPassword} = req.body;

		const user = await User.findById(id);

		user.name = name;
		user.email = email;
		user.role = role;
		user.isActive = isActive;

		if(newPassword && confirmPassword){

		if(newPassword !== confirmPassword){
		return res.send("New passwords do not match");
		}

		const passwordRegex =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

		if(!passwordRegex.test(newPassword)){
		return res.send("Password must contain 8 characters, uppercase, lowercase, number and special symbol");
		}

		const match = await bcrypt.compare(currentPassword,user.password);

		if(!match){
		return res.send("Current password incorrect");
		}

		user.password = await bcrypt.hash(newPassword,10);

		}

		await user.save();

		res.redirect("/users");

		}catch(err){

		console.log(err);
		res.send("Update error");

		}

}

module.exports.deleteUser=async(req,res)=>{
	try{
		await User.findByIdAndDelete(req.params.id)
		res.redirect("/users")
	}catch(err){
		console.log("err fetching in delete")
	}
}








































