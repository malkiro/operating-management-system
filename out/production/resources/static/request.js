window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);

    privilages = httpRequest("../privilage?module=REQUEST","GET");

    //Data services for Combo Boxes
    requesttatuses = httpRequest("../requeststatus/list","GET");
    employeecreated = httpRequest("../employee/list","GET");
    employeeconfirmed = httpRequest("../employee/list","GET");



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
    requests = new Array();
    var data = httpRequest("/request/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) requests = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblRequest',requests,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblRequest);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblRequest,activerowno,active);

}

function selectDeleteRow() {
    for(index in requests){
        if(requests[index].requeststatusId.name =="Deleted"){
            tblRequest.children[1].children[index].style.color = "#f00";
            tblRequest.children[1].children[index].style.fontWeight = "bold";
            tblRequest.children[1].children[index].lastChild.children[1].disabled = true;
            tblRequest.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(oldrequest==null){
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

function viewitem(req,rowno) {

    request = JSON.parse(JSON.stringify(req));

    tbNumber.innerHTML = request.no;
    tbStatus.innerHTML = request.requeststatusId.name;
    tbRequesteddate.innerHTML = request.requesteddate;
    tbRequest.innerHTML = request.requestdetails;
    tbRequestby.innerHTML = request.employeeId.callingname;
    tbConfirmdate.innerHTML = request.confirmdate;
    tbConfirmby.innerHTML = request.conemployeeId.callingname;

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Request Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    request = new Object();
    oldrequest = null;

    fillCombo(cmbStatus, "", requesttatuses, "name", "Pending");
    request.requeststatusId = JSON.parse(cmbStatus.value);

    fillCombo(cmbRequestby, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    request.employeeId = JSON.parse(cmbRequestby.value);
    cmbRequestby.disabled="disabled";

    fillCombo(cmbConfirmby, "Select Employee", employeeconfirmed, "callingname");

    var today = new Date();
    var month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = today.getDate();
    if (date < 10) date = "0" + date;

    dteRequested.value = today.getFullYear() + "-" + month + "-" + date;
    request.requesteddate = dteRequested.value;
    dteRequested.disabled = "disabled";

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/request/nextnumber", "GET");
    txtNumber.value = nextNumber.no;
    request.no = txtNumber.value;
    txtNumber.disabled = "disabled";

    cmbStatus.setAttribute("disabled", "disabled");
    dteConfirm.disabled = true;
    cmbConfirmby.disabled = true;
    $("#chkClose").prop("checked", false);

    txtRequest.value = "";
    txtRequest.disabled =false;
    dteConfirm.value = "";

    setStyle(initial);
    txtNumber.style.border=valid;
    cmbStatus.style.border=valid;
    dteRequested.style.border=valid;
    cmbRequestby.style.border=valid;

    disableButtons(false, true, true);

}

function setStyle(style) {
    txtNumber.style.border = style;
    cmbStatus.style.border = style;
    dteRequested.style.border = style;
    cmbRequestby.style.border = style;
    txtRequest.style.border = style;
    dteConfirm.style.border = style;
    cmbConfirmby.style.border = style;
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

    if (request.requestdetails == null){
        errors = errors + "\n" + "Requested Detail Not Enter";
        txtRequest.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;

}

function btnAddMC(){
    if(getErrors()==""){
        if(dteConfirm.value=="" ||cmbConfirmby.value==""){
            swal({
                title: "Are you sure to continue...?",
                text: "Form has some empty fields.....",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willAdd) => {
                if (willAdd) {
                    savedata();
                }
            });

        }else{
            savedata();
        }
    }else{
        swal({
            title: "You have following errors",
            text: "\n"+getErrors(),
            icon: "error",
            button: true,
        });

    }
}

function savedata() {

    swal({
        title: "Are you sure to add following Request...?" ,
        text :  "\nRequest Number : " + request.no +
            "\nRequest Status : " + request.requeststatusId.name +
            "\nRequested Date  : " + request.requesteddate +
            "\nRequested By  : " + request.employeeId.callingname +
            "\nRequested Detail  : " + request.requestdetails,
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/request", "POST", request);
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
                button: true
            });
        }
    });

}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(oldrequest == null && addvalue == ""){
        loadForm();
        selectDeleteRow();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning", buttons: true, dangerMode: true,
        }).then((willClear) => {
            if (willClear) {
                loadForm();
                selectDeleteRow();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldrequest==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
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
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm();
                    selectDeleteRow();
                }else{

                }
            });
        }
    }
}


function fillForm(req,rowno){
    activerowno = rowno;

    clearSelection(tblRequest);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblRequest,activerowno,active);

    request = JSON.parse(JSON.stringify(req));
    oldrequest = JSON.parse(JSON.stringify(req));

    cmbStatus.removeAttribute("disabled", "disabled");
    dteConfirm.disabled = false;
    cmbConfirmby.disabled = false;

    var today = new Date();
    var month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = today.getDate();
    if (date < 10) date = "0" + date;

    dteConfirm.value = today.getFullYear() + "-" + month + "-" + date;
    request.confirmdate = dteConfirm.value;
    dteConfirm.disabled = "disabled";

    txtNumber.value = request.no;
    dteRequested.value = request.requesteddate;
    cmbRequestby.value = request.employeeId.callingname;
    txtRequest.value = request.requestdetails;


    fillCombo(cmbStatus, "", requesttatuses, "name",request.requeststatusId.name);
    fillCombo(cmbRequestby, "", employeecreated, "callingname",request.employeeId.callingname);

    setStyle(valid);

    if (request.conemployeeId == null) {
        fillCombo(cmbConfirmby, "Select Employee", employeeconfirmed, "callingname", session.getObject('activeuser').employeeId.callingname);
        request.conemployeeId = JSON.parse(cmbConfirmby.value);
        cmbConfirmby.disabled="disabled";
        cmbConfirmby.style.border = valid;
    }else {
        fillCombo(cmbConfirmby, "Select Employee", employeeconfirmed, "callingname", request.conemployeeId.callingname);
        cmbConfirmby.style.border = valid;
        cmbConfirmby.disabled="disabled";
    }


    if (request.confirmdate == null) {
        dteConfirm.style.border = initial;
    }else {
        dteConfirm.value = request.confirmdate;
        dteConfirm.style.border = valid;
    }

    if (request.requeststatusId.id == 2) {
        txtRequest.disabled = true;
        cmbStatus.disabled = true;
    }

}

function getUpdates() {

    var updates = "";

    if(request!=null && oldrequest!=null) {

        if (request.requestdetails != oldrequest.requestdetails)
            updates = updates + "\nRequested Detail is Changed";

        if (request.requeststatusId.name != oldrequest.requeststatusId.name)
            updates = updates + "\nRequest Status is Changed";

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
                title: "Are you sure to update following Request details...?",
                text: "\n"+ getUpdates() +
                    "\nConfirm  Dated  : " + request.confirmdate +
                    "\nConfirm  By  : " + request.conemployeeId.callingname,
                icon: "warning", buttons: true, dangerMode: true,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/request", "PUT", request);
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
            button: true});

}

function btnDeleteMC(req) {
    request = JSON.parse(JSON.stringify(req));

    swal({
        title: "Are you sure to delete following Request...?",
        text :  "\nRequest Number : " + request.no +
            "\nRequest Status : " + request.requeststatusId.name +
            "\nRequested Date  : " + request.requesteddate +
            "\nRequested By  : " + request.employeeId.callingname +
            "\nRequested Detail  : " + request.requestdetails,
        icon: "warning", buttons: true, dangerMode: true,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/request","DELETE",request);
            if (responce==0) {
                swal({
                    title: "Deleted Successfully....!",
                    text: "\n\n  Status change to delete",
                    icon: "success", button: false, timer: 1200,
                });
                loadForm();
                loadSearchedTable();
            } else {
                swal({
                    title: "You have following erros....!",
                    text: "\n\n" + responce,
                    icon: "error", button: true,
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

function btnPrintTableMC(request) {

    var newwindow=window.open();
    formattab = tblRequest.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Request Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(reqind) {
    cindex = reqind;

    var rprop = tblRequest.firstChild.firstChild.children[cindex].getAttribute('property');

    if(rprop.indexOf('.') == -1) {
        requests.sort(
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
        requests.sort(
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
    fillTable('tblRequest',requests,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblRequest);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblRequest,activerowno,active);

}

