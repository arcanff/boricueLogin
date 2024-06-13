function isLog (req, res){
    console.log("COOKIE",req.header.cookie);
}

function isntlog (req, res){
    console.log("COOKIE",req.header.cookie);
}

export default {
    isLog,
    isntlog
}