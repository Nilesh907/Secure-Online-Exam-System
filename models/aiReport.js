const mongoose = require("mongoose");

const aiReportSchema = new mongoose.Schema(
{
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    riskScore:{
        type:Number,
        default:0
    },

    threatLevel:{
        type:String,
        enum:["LOW","MEDIUM","HIGH"],
        default:"LOW"
    },

    // ---------------- Security Report ----------------

    prediction:{
        type:String
    },

    reason:[
        String
    ],

    recommendation:[
        String
    ],

    confidence:{
        type:Number,
        default:0
    },

    recommendedAction:{
        type:String,
        default:"Continue Monitoring"
    },

    provider:{
        type:String
    },

    // ---------------- Leak Prediction ----------------

    leakPrediction:{
        type:String
    },

    futureRisk:{
        type:String
    },

    leakPredictionText:{
        type:String
    },

    leakRecommendation:[
        String
    ],

    leakProvider:{
        type:String
    },

    // ---------------- Other ----------------

    violationType:{
        type:String
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("AIReport",aiReportSchema);