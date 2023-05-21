window.addEventListener("load", getDate);

//Initializing Functions

function getDate() {
    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;


    txtSdate.max = today.getFullYear()+"-"+month+"-"+date;
    txtEdate.max = today.getFullYear()+"-"+month+"-"+date;

}

function txtSdateMC() {

}



