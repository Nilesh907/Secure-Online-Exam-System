const paperProject = {

  users: [
    {
      _id: "65f100000000000000000011",
      name: "Rahul Kumar",
      email: "rahul.admin@gmail.com",
      password: "admin#123",
      role: "Admin"
    },
    {
      _id: "65f100000000000000000012",
      name: "Anjali Verma",
      email: "anjali.teacher@gmail.com",
      password: "teacher#123",
      role: "Teacher"
    },
    {
      _id: "65f100000000000000000013",
      name: "Vikram Singh",
      email: "vikram.teacher@gmail.com",
      password: "teacher#456",
      role: "Teacher"
    },
    {
      _id: "65f100000000000000000014",
      name: "Priya Sharma",
      email: "priya.student@gmail.com",
      password: "student#123",
      role: "Student"
    },
    {
      _id: "65f100000000000000000015",
      name: "Arjun Mehta",
      email: "arjun.reviewer@gmail.com",
      password: "reviewer#123",
      role: "Reviewer"
    }
  ],

 teachers:[
	{
     _id: "65f300000000000000000031",
     user: "65f100000000000000000011",
     teacherId: "TCH-CS-001",
     department: "Computer Science",
	  qualification:"PHD",
	  designation:"Assitant Professor",
     experience: 5
   },
   {
     _id: "65f300000000000000000032",
     user: "65f100000000000000000012",
     teacherId: "TCH-CS-002",
     department: "Computer Science",
	  qualification:"B.Teach",
	  designation: "Lecturer",
     experience: 3
   },
   {
     _id: "65f300000000000000000033",
     user: "65f100000000000000000013",
     teacherId: "TCH-IT-003",
     department: "Information Technology",
	  qualification:"M.Teach",
	  designation:"Associate Professor",
	  experience:4
   },
   {
     _id: "65f300000000000000000034",
     user: "65f100000000000000000014",
     teacherId: "TCH-IT-004",
     department: "Information Technology",
	  qualification:"PHD",
	  designation:"Assistant Professor",
     experience: 2
   },
   {
     _id: "65f300000000000000000035",
     user: "65f100000000000000000015",
     teacherId: "TCH-CS-005",
     department: "Computer Science",
	  qualification:"B.Teach",
	  designation:"Lecturer",
     experience: 4
	}
 ],

 reviewers:[
	{
     _id: "65f400000000000000000041",
     user: "65f100000000000000000011",
     reviewerId: "REV-CS-001",
     department: "Computer Science",
     assignedPapers: []
   },
   {
     _id: "65f400000000000000000042",
     user: "65f100000000000000000012",
     reviewerId: "REV-CS-002",
     department: "Computer Science",
     assignedPapers: []
   },
   {
     _id: "65f400000000000000000043",
     user: "65f100000000000000000013",
     reviewerId: "REV-IT-003",
     department: "Information Technology",
     assignedPapers: []
   },
   {
     _id: "65f400000000000000000044",
     user: "65f100000000000000000014",
     reviewerId: "REV-IT-004",
     department: "Information Technology",
     assignedPapers: []
   },
   {
     _id: "65f400000000000000000045",
     user: "65f100000000000000000015",
     reviewerId: "REV-CS-005",
     department: "Computer Science",
     assignedPapers: []
   }
 ],

 students:[
	{
     _id: "65f200000000000000000021",
     user: "65f100000000000000000011",
     enrollmentNumber: "CS231001",
     department: "Computer Science",
     semester: "5",
   },
   {
     _id: "65f200000000000000000022",
     user: "65f100000000000000000012",
     enrollmentNumber: "CS231002",
     department: "Computer Science",
     semester: "6",
   },
   {
     _id: "65f200000000000000000023",
     user: "65f100000000000000000013",
     enrollmentNumber: "CS231003",
     department: "Computer Science",
     semester: "5",
   },
   {
     _id: "65f200000000000000000024",
     user: "65f100000000000000000014",
     enrollmentNumber: "CS231004",
     department: "Information Technology",
     semester: "4",
   },
   {
     _id: "65f200000000000000000025",
     user: "65f100000000000000000015",
     enrollmentNumber: "CS231005",
     department: "Information Technology",
     semester: "6",
   }
 ],

 papers: [
  {
    _id: "65f200000000000000000011",
    subject: "Computer Science",
    department: "Computer Science",
    title: "DBMS End Semester",
    uploadedBy: "65f100000000000000000014",
    reviewedBy: "65f100000000000000000015",

    encryptedFilePath: "/storage/dbms.pdf",
    paperKey: "paper-key-dbms-001",
    hash: "hash-dbms-001",
    fileIV: "iv-dbms-001",
    authTag: "tag-dbms-001",

    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),

    watermarkText: "SECURE-WM-101",
    status: "APPROVED",

    questions: [
      { question: "Explain normalization with example.", marks: 10 },
      { question: "Write SQL queries for different joins.", marks: 15 },
      { question: "Discuss ACID properties.", marks: 10 },
      { question: "Explain indexing in DBMS.", marks: 5 },
      { question: "Differentiate between OLTP and OLAP.", marks: 10 }
    ]
  },

  {
    _id: "65f200000000000000000012",
    subject: "Mathematics",
    department: "Mathematics",
    title: "Linear Algebra",
    uploadedBy: "65f100000000000000000014",
    reviewedBy: "65f100000000000000000015",

    encryptedFilePath: "/storage/la.pdf",
    paperKey: "paper-key-la-002",
    hash: "hash-la-002",
    fileIV: "iv-la-002",
    authTag: "tag-la-002",

    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),

    watermarkText: "SECURE-WM-102",
    status: "APPROVED",

    questions: [
      { question: "Define eigenvalues and eigenvectors.", marks: 10 },
      { question: "Explain matrix multiplication.", marks: 10 },
      { question: "Find determinant of a matrix.", marks: 10 },
      { question: "Explain rank of matrix.", marks: 5 },
      { question: "Solve system using Gaussian elimination.", marks: 15 }
    ]
  },

  {
    _id: "65f200000000000000000013",
    subject: "Physics",
    department: "Physics",
    title: "Quantum Mechanics",
    uploadedBy: "65f100000000000000000014",
    reviewedBy: "65f100000000000000000015",

    encryptedFilePath: "/storage/qm.pdf",
    paperKey: "paper-key-qm-003",
    hash: "hash-qm-003",
    fileIV: "iv-qm-003",
    authTag: "tag-qm-003",

    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),

    watermarkText: "SECURE-WM-103",
    status: "APPROVED",

    questions: [
      { question: "Explain wave-particle duality.", marks: 10 },
      { question: "State Heisenberg uncertainty principle.", marks: 10 },
      { question: "Describe Schrodinger equation.", marks: 15 },
      { question: "Explain quantum tunneling.", marks: 5 },
      { question: "Define probability density.", marks: 10 }
    ]
  },

  {
    _id: "65f200000000000000000014",
    subject: "English",
    department: "English",
    title: "Literature Final",
    uploadedBy: "65f100000000000000000014",
    reviewedBy: "65f100000000000000000015",

    encryptedFilePath: "/storage/english.pdf",
    paperKey: "paper-key-eng-004",
    hash: "hash-eng-004",
    fileIV: "iv-eng-004",
    authTag: "tag-eng-004",

    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),

    watermarkText: "SECURE-WM-104",
    status: "DRAFT",

    questions: [
      { question: "Discuss Romantic poetry.", marks: 10 },
      { question: "Explain Shakespearean tragedy.", marks: 15 },
      { question: "Write short note on symbolism.", marks: 10 },
      { question: "Analyze a modern poem.", marks: 5 },
      { question: "Define literary criticism.", marks: 10 }
    ]
  },

  {
    _id: "65f200000000000000000015",
    subject: "Computer Networks",
    department: "Computer Science",
    title: "CN End Semester",

    uploadedBy: "65f100000000000000000014",
    reviewedBy: "65f100000000000000000015",

    encryptedFilePath: "/storage/cn.pdf",
    paperKey: "paper-key-cn-005",
    hash: "hash-cn-005",
    fileIV: "iv-cn-005",
    authTag: "tag-cn-005",

    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),

    watermarkText: "SECURE-WM-105",
    status: "APPROVED",

    questions: [
      { question: "Explain OSI model.", marks: 10 },
      { question: "Describe TCP/IP model.", marks: 10 },
      { question: "What is subnetting?", marks: 10 },
      { question: "Explain routing algorithms.", marks: 10 },
      { question: "Differentiate TCP and UDP.", marks: 10 }
    ]
  }
  ]

}

module.exports=paperProject;






































































































































































































































