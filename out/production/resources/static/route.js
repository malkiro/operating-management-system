window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);

    privilages = httpRequest("../privilage?module=DISTRIBUTIONROUTE","GET");

    //Data services for Combo Boxes
    routestatuses = httpRequest("../distributionroutestatus/list","GET");
    employeecreated = httpRequest("../employee/list","GET");

    valid = "3px solid green";
    invalid = "3px solid red";
    initial = "3px solid #d6d6c2";
    updated = "3px solid #ff9900";
    active = "#ff9900";

    loadForm();
    loadView();
    disableButtons(false, true, true);
    selectDeleteRow();

}


function loadView() {

     //Search Area
    txtSearchname.value="";
    txtSearchname.style.background = "";

    //Table Area
    activerowno = "";
    activepage = 1;
    var query = "&searchtext=";
    loadTable(1,cmbPagesize.value,query);
}

function loadTable(page,size,query) {
    page = page - 1;
    routes = new Array();
    var data = httpRequest("/distributionroute/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) routes = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblRoute',routes,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblRoute);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblRoute,activerowno,active);

}

function selectDeleteRow() {
    for(index in routes){
        if(routes[index].distributionroutestatusId.name =="Deleted"){
            tblRoute.children[1].children[index].style.color = "#f00";
            tblRoute.children[1].children[index].style.fontWeight = "bold";
            tblRoute.children[1].children[index].lastChild.children[1].disabled = true;
            tblRoute.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(olddistributionroute==null){
        paginate=true;
    }else{
        if(getErrors()==''&&getUpdates()==''){
            paginate=true;
        }else{
            paginate = window.confirm("Form has Some Errors or Update Values. " +
                "Are you sure to discard that changes ?");
        }
    }
    if(paginate) {
        activepage=page;
        activerowno=""
        loadSearchedTable();
        loadForm();
    }

}

function viewitem(rt,rowno) {
    distributionroute = JSON.parse(JSON.stringify(rt));

    tbRNumber.innerHTML = distributionroute.routeno;
    tbRname.innerHTML = distributionroute.routename;
    tbRstatus.innerHTML = distributionroute.distributionroutestatusId.name;
    tbDate.innerHTML =  distributionroute.date;
    tbEmployee.innerHTML = distributionroute.employeeId.callingname;

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Route Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    distributionroute = new Object();
    olddistributionroute = null;

    fillCombo(cmbRstatus, "Select Route Status", routestatuses, "name","Available");
    distributionroute.distributionroutestatusId = JSON.parse(cmbRstatus.value);
    cmbRstatus.disabled="disabled";

    fillCombo(cmbEmployee, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    distributionroute.employeeId = JSON.parse(cmbEmployee.value);
    cmbEmployee.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    txtDate.value=today.getFullYear()+"-"+month+"-"+date;
    distributionroute.date=txtDate.value;
    txtDate.disabled="disabled";

    $("#chkClose").prop("checked", false);


    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/distributionroute/nextnumber", "GET");
    txtRNumber.value = nextNumber.routeno;
    distributionroute.routeno = txtRNumber.value;
    txtRNumber.disabled="disabled";

    txtRname.value = "";

    setStyle(initial);
    txtRNumber.style.border=valid;
    cmbRstatus.style.border=valid;
    txtDate.style.border=valid;
    cmbEmployee.style.border=valid;

    disableButtons(false, true, true);
}

function setStyle(style) {
    txtRNumber.style.border = style;
    txtRname.style.border = style;
    cmbRstatus.style.border = style;
    txtDate.style.border = style;
    cmbEmployee.style.border = style;
}


function disableButtons(add, upd, del) {

    if (add || !privilages.add) {
        btnAdd.setAttribute("disabled", "disabled");
        $('#btnAdd').css('cursor','not-allowed');
    }
    else {
        btnAdd.removeAttribute("disabled");
        $('#btnAdd').css('cursor','pointer')
    }

    if (upd || !privilages.update) {
        btnUpdate.setAttribute("disabled", "disabled");
        $('#btnUpdate').css('cursor','not-allowed');
    }
    else {
        btnUpdate.removeAttribute("disabled");
        $('#btnUpdate').css('cursor','pointer');
    }

    if (!privilages.update) {
        $(".buttonup").prop('disabled', true);
        $(".buttonup").css('cursor','not-allowed');
    }
    else {
        $(".buttonup").removeAttr("disabled");
        $(".buttonup").css('cursor','pointer');
    }

    if (!privilages.delete){
        $(".buttondel").prop('disabled', true);
        $(".buttondel").css('cursor','not-allowed');
    }
    else {
        $(".buttondel").removeAttr("disabled");
        $(".buttondel").css('cursor','pointer');
    }

}


function getErrors() {

    var errors = "";
    addvalue = "";


    if (distributionroute.routename == null){
        errors = errors + "\n" + "Route Name Not Enter";
        txtRname.style.border = invalid;
    }

    else  addvalue = 1;

    return errors;

}

function btnAddMC(){

    if(getErrors()==""){
        savedata();
    }else{
        swal({
            title: "You have following errors",
            text: "\n"+getErrors(),
            icon: "error",
            button: true,
            closeOnClickOutside: false,
        });

    }
}

function savedata() {

    swal({
        title: "Are you sure to add following Route...?" ,
        text :  "\nRoute Number : " + distributionroute.routeno +
            "\nRoute Name : " + distributionroute.routename +
            "\nRoute Status  : " + distributionroute.distributionroutestatusId.name +
            "\nRegistered Date : " + distributionroute.date +
            "\nRegistered By : " + distributionroute.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/distributionroute", "POST", distributionroute);
            if (response == "0") {
                swal({
                    position: 'center',
                    icon: 'success',
                    title: 'Your work has been Done \n Save SuccessFully..!',
                    text: '\n',
                    button: false,
                    timer: 1200
                });
                $(document).ready(function(){
                    if($('#chkClose').prop("checked") == true){
                        loadForm();
                    }else if($('#chkClose').prop("checked") == false){
                        $('#formmodal').modal('hide');
                        loadForm();
                    }
                });
                activerowno = 1;
                loadSearchedTable();
            }
            else swal({
                title: 'Save not Success... , You have following errors', icon: "error",
                text: '\n ' + response,
                button: true,
                closeOnClickOutside: false,
            });
        }
    });

}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(olddistributionroute == null && addvalue == ""){
        loadForm();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning",
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willClear) => {
            if (willClear) {
                loadForm();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(olddistributionroute==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm();
                    selectDeleteRow();
                }else{

                }
            });
        }else{
            $('#formmodal').modal('hide');
            loadForm();
            selectDeleteRow();
        }

    }
    else{
        if(getErrors()==''&&getUpdates()==''){
            $('#formmodal').modal('hide');
            loadForm();
            selectDeleteRow();
        }else{
            swal({
                title: "Form has Some Update Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm();
                    selectDeleteRow();
                }
            });
        }
    }
}



function fillForm(rt,rowno){
    activerowno = rowno;

    clearSelection(tblRoute);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblRoute,activerowno,active);

    distributionroute = JSON.parse(JSON.stringify(rt));
    olddistributionroute = JSON.parse(JSON.stringify(rt));


    txtRNumber.value = distributionroute.routeno;
    txtRname.value = distributionroute.routename;
    txtDate.value = distributionroute.date;

    cmbRstatus.disabled = false;

    fillCombo(cmbRstatus, "", routestatuses, "name",distributionroute.distributionroutestatusId.name);
    fillCombo(cmbEmployee, "", employeecreated, "callingname",distributionroute.employeeId.callingname);

    setStyle(valid);

}

function getUpdates() {

    var updates = "";

    if(distributionroute!=null && olddistributionroute!=null) {

        if (distributionroute.routename != olddistributionroute.routename)
            updates = updates + "\nRoute Name is Changed";

        if (distributionroute.distributionroutestatusId.name != olddistributionroute.distributionroutestatusId.name)
            updates = updates + "\nRoute Status is Changed";
    }

    return updates;

}

function btnUpdateMC() {
    var errors = getErrors();
    if (errors == "") {
        var updates = getUpdates();
        if (updates == "")
            swal({
                title: 'Nothing Updated..!',icon: "warning",
                text: '\n',
                button: false,
                timer: 1200});
        else {
            swal({
                title: "Are you sure to update following Route details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/distributionroute", "PUT", distributionroute);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Your work has been Done \n Update SuccessFully..!',
                            text: '\n',
                            button: false,
                            timer: 1200
                        });
                        $(document).ready(function(){
                            if($('#chkClose').prop("checked") == true){
                                loadForm();
                            }else if($('#chkClose').prop("checked") == false){
                                $('#formmodal').modal('hide');
                                loadForm();
                            }
                        });
                        loadSearchedTable();

                    }
                    else window.alert("Failed to Update as \n\n" + response);
                }
            });
        }
    }
    else
        swal({
            title: 'You have following errors in your form',icon: "error",
            text: '\n '+getErrors(),
            button: true,
            closeOnClickOutside: false,
        });

}

function btnDeleteMC(rt) {
    distributionroute = JSON.parse(JSON.stringify(rt));

    swal({
        title: "Are you sure to delete following Route...?",
        text :  "\nRoute Number : " + distributionroute.routeno +
            "\nRoute Name  : " + distributionroute.routename +
            "\nRoute Status  : " + distributionroute.distributionroutestatusId.name +
            "\nRegistered Date : " + distributionroute.date +
            "\nRegistered By : " + distributionroute.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/distributionroute","DELETE",distributionroute);
            if (responce==0) {
                swal({
                    title: "Deleted Successfully....!",
                    text: "\n\n  Status change to delete",
                    icon: "success",
                    button: false,
                    timer: 1200,
                });
                loadForm();
                loadSearchedTable();
            } else {
                swal({
                    title: "You have following erros....!",
                    text: "\n\n" + responce,
                    icon: "error",
                    button: true,
                    closeOnClickOutside: false,
                });
            }
        }
    });

}

function loadSearchedTable() {

    var searchtext = txtSearchname.value;

    var query ="&searchtext=";

    if(searchtext!="")
        query = "&searchtext=" + searchtext;
    //window.alert(query);
    loadTable(activepage, cmbPagesize.value, query);

}

function btnSearchMC(){
    activepage=1;
    loadSearchedTable();
}

function btnSearchClearMC(){
       loadView();
}

function btnPrintTableMC(distributionroute) {

    var newwindow=window.open();
    formattab = tblRoute.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Route Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(rtind) {
    rtindex = rtind;

    var rprop = tblRoute.firstChild.firstChild.children[rtindex].getAttribute('property');

    if(rprop.indexOf('.') == -1) {
        routes.sort(
            function (a, b) {
                if (a[rprop] < b[rprop]) {
                    return -1;
                } else if (a[rprop] > b[rprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        routes.sort(
            function (a, b) {
                if (a[rprop.substring(0,rprop.indexOf('.'))][rprop.substr(rprop.indexOf('.')+1)] < b[rprop.substring(0,rprop.indexOf('.'))][rprop.substr(rprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[rprop.substring(0,rprop.indexOf('.'))][rprop.substr(rprop.indexOf('.')+1)] > b[rprop.substring(0,rprop.indexOf('.'))][rprop.substr(rprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblRoute',routes,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblRoute);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblRoute,activerowno,active);

}

