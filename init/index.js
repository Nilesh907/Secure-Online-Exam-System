const mongoose=require("mongoose")
const bcrypt = require("bcrypt");
const data=require("./data.js");

//IMPORT MODELS

const User=require("../models/User.js")
const Teacher=require("../models/Teacher.js")
const Reviewer=require("../models/Reviewer.js")
const Student=require("../models/Student.js")
const Paper=require("../models/Paper.js")



MONGOURL='mongodb://127.0.0.1:27017/MinorProject'

main()
	.then((res)=>{
		console.log("connection successful")
		initDB();
	})
	.catch((err)=>{
		console.log(err)
	})
async function main(){
	await mongoose.connect(MONGOURL)
}




const initDB= async()=>{
	await User.deleteMany({})
	await Teacher.deleteMany({});
    await Reviewer.deleteMany({});
    await Student.deleteMany({});
    await Paper.deleteMany({});


		const hashedUsers = [];
        for(let user of data.users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            hashedUsers.push({
                _id: (user._id),
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role
            });
        }

    await User.insertMany(hashedUsers);
  	await Student.insertMany(data.students);
  	await Teacher.insertMany(data.teachers);
  	await Reviewer.insertMany(data.reviewers);
  	await Paper.insertMany(data.papers);
	console.log("data was initilized")
}

