window.addEventListener("load", initialize);

//Initializing Functions

function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);

    privilages = httpRequest("../privilage?module=DISTRIBUTE","GET");

    //Data services for Combo Boxes
    distributionroutes = httpRequest("../distributionroute/list","GET");
    activedistributionroutes = httpRequest("../distributionroute/activelist","GET");
    deliveryagents = httpRequest("../employee/deliveryagentlist","GET");
    vehicles = httpRequest("../vehicle/list","GET");
    drivers = httpRequest("../employee/driverlist","GET");
    distributionstatuses = httpRequest("../distributionstatus/list","GET");
    employeecreated = httpRequest("../employee/list","GET");
    invoices = httpRequest("../invoice/list","GET");
    supcrews = httpRequest("../employee/supportivecrewlist","GET");

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
    distributes = new Array();

    var data = httpRequest("/distribute/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) distributes = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblDistribute',distributes,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblDistribute);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblDistribute,activerowno,active);
}

function selectDeleteRow() {
    for(index in distributes){
        if(distributes[index].distributionstatusId.name =="Deleted"){
            tblDistribute.children[1].children[index].style.color = "#f00";
            tblDistribute.children[1].children[index].style.fontWeight = "bold";
            tblDistribute.children[1].children[index].lastChild.children[1].disabled = true;
            tblDistribute.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(olddistribute==null){
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
        activerowno="";
        loadSearchedTable();
        loadForm();
    }

}

function viewitem(dis,rowno) {

    distribute = JSON.parse(JSON.stringify(dis));

    tbDeliveryno.innerHTML = distribute.distributionno;
    tbRoute.innerHTML = distribute.distributionrouteId.routeno;
    fillInnerTable("tblPrintInvoiceInnerItem", distribute.distributeInvoiceList,null , deleteInvoiceInnerForm);
    fillInnerTable("tblPrintCrewInnerItem", distribute.supportiveCrewList, null , deleteCrewInnerForm);
    tbTotalinvoice.innerHTML = distribute.totalinvoice;
    tbAgent.innerHTML = distribute.deliveryagentId.callingname;
    tbVehicle.innerHTML = distribute.vehicleId.vehicleno;
    tbDriver.innerHTML = distribute.driverId.callingname;
    tbDeldate.innerHTML = distribute.distributiondate;
    tbDelstatus.innerHTML = distribute.distributionstatusId.name;
    tbDescription.innerHTML = distribute.description;
    tbCreateddate.innerHTML = distribute.addeddate;
    tbEmployeeCreated.innerHTML = distribute.employeeId.callingname;
}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Distribute Process Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}


function loadForm() {
    distribute = new Object();
    olddistribute = null;

    distribute.distributeInvoiceList = new Array();
    distribute.supportiveCrewList = new Array();

    fillCombo(cmbRoute, "Select Distribute Route", activedistributionroutes, "routename");
    fillCombo(cmbAgent, "Select Delivery Agent", deliveryagents, "callingname");
    fillCombo(cmbVehicle, "Select Vehicle", vehicles, "vehicleno");
    fillCombo(cmbDriver, "Select Driver", drivers, "callingname");

    fillCombo(cmbDelstatus, "", distributionstatuses, "name", "In-Delivery");
    distribute.distributionstatusId = JSON.parse(cmbDelstatus.value);

    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    distribute.employeeId = JSON.parse(cmbEmployeeCreated.value);
    cmbEmployeeCreated.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteCreateddate.value=today.getFullYear()+"-"+month+"-"+date;
    distribute.addeddate=dteCreateddate.value;
    dteCreateddate.disabled="disabled";

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/distribute/nextnumber", "GET");
    txtDeliveryno.value = nextNumber.distributionno;
    distribute.distributionno = txtDeliveryno.value;
    txtDeliveryno.disabled="disabled";

    cmbDelstatus.setAttribute("disabled", "disabled");
    $("#chkClose").prop("checked", false);

    txtTotalinvoice.value = "";
    dteDeldate.value = "";
    txtDescription.value = "";

    setStyle(initial);
    txtDeliveryno.style.border=valid;
    cmbDelstatus.style.border=valid;
    dteCreateddate.style.border=valid;
    cmbEmployeeCreated.style.border=valid;
    invoiceFlied.style.border = initial;
    invoiceFliedLegend.style.border = initial;
    supportiveCrewFlied.style.border = initial;
    supportiveCrewFliedLegend.style.border = initial;

    disableButtons(false, true, true);

    refreshInvoiceInnerForm();
    refreshCrewInnerForm();
}

function refreshInvoiceInnerForm() {
    fillCombo(cmbInvoice, "Select Invoice", invoices, "invoiceno", "");
    cmbInvoice.style.border = initial;

    // chkStatus.checked = "checked";
    // $('#chkStatus').bootstrapToggle('off');
    // distributeinvoice.delivered = false;

    fillInnerTable("tblInvoiceInnerItem", distribute.distributeInvoiceList, null, deleteInvoiceInnerForm);

    if(distribute.distributeInvoiceList.length != 0)
        for(var i=0; i<tblInvoiceInnerItem.children[1].children.length; i++){
            tblInvoiceInnerItem.children[1].children[i].lastChild.firstChild.style.display = "none";
        }
}

function  refreshCrewInnerForm() {
    fillCombo(cmbEmployeecrew, "Select Employee", supcrews, "callingname", "");
    cmbEmployeecrew.style.border = initial;

    fillInnerTable("tblCrewInnerItem", distribute.supportiveCrewList, null , deleteCrewInnerForm);

    if(distribute.supportiveCrewList.length != 0)
        for(var i=0; i<tblCrewInnerItem.children[1].children.length; i++){
            tblCrewInnerItem.children[1].children[i].lastChild.firstChild.style.display = "none";
        }


}

function innerinvoicegetErrors() {
    var errors = "";
    addvalue = "";

    if (cmbInvoice.value == ""){
        errors = errors + "\n" + "Invoice Not Selected";
        cmbInvoice.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;
}

function btnInvoiceInnerAddMC() {
    if(innerinvoicegetErrors()==""){
        distributeinvoice = new Object();
        distributeinvoice.invoiceId = JSON.parse(cmbInvoice.value);
        invoiceexs = false;
        for(index in distribute.distributeInvoiceList){
            if(distribute.distributeInvoiceList[index].invoiceId.invoiceno == JSON.parse(cmbInvoice.value).invoiceno){
                invoiceexs = true;
                break;
            }
        }

        if(invoiceexs){
            swal({
                title: "Invoice Already Exsits",
                text: "\n",
                icon: "warning",
                buttons : false,
                timer: 1200,
            })
        }else {
            distribute.distributeInvoiceList.push(distributeinvoice);
            refreshInvoiceInnerForm();
            if (distribute.distributeInvoiceList.length != null) {
                invoiceFlied.style.border = valid;
                invoiceFliedLegend.style.border = valid;
            }

            if (olddistribute != null && isEqual(distribute.distributeInvoiceList, olddistribute.distributeInvoiceList, 'invoiceId')) {
                invoiceFlied.style.border = updated;
                invoiceFliedLegend.style.border = updated;
            }
        }
    }else {
        swal({
            title: "You have following errors",
            text: "\n"+innergetErrors(),
            icon: "error",
            button: true,
        });
    }


}

function innercrewgetErrors() {
    var errors = "";
    addvalue = "";

    if (cmbEmployeecrew.value == ""){
        errors = errors + "\n" + "Employee Not Selected";
        cmbEmployeecrew.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;
}

function btnCrewInnerAddMC() {
    if(innercrewgetErrors()==""){
        supportivecrew = new Object();
        supportivecrew.employeeId = JSON.parse(cmbEmployeecrew.value);
        crewexs = false;
        for(index in distribute.supportiveCrewList){
            if(distribute.supportiveCrewList[index].employeeId.callingname == JSON.parse(cmbEmployeecrew.value).callingname){
                crewexs = true;
                break;
            }
        }

        if(crewexs){
            swal({
                title: "Employee Already Exsits",
                text: "\n",
                icon: "warning",
                buttons : false,
                timer: 1200,
            })
        }else {
            distribute.supportiveCrewList.push(supportivecrew);
            refreshCrewInnerForm();
            if (distribute.supportiveCrewList.length != null) {
                supportiveCrewFlied.style.border = valid;
                supportiveCrewFliedLegend.style.border = valid;
            }

            if (olddistribute != null && isEqual(distribute.supportiveCrewList, olddistribute.supportiveCrewList, 'employeeId')) {
                supportiveCrewFlied.style.border = updated;
                supportiveCrewFlied.style.border = updated;
            }
        }
    }else {
        swal({
            title: "You have following errors",
            text: "\n"+innergetErrors(),
            icon: "error",
            button: true,
        });
    }

}

function deleteInvoiceInnerForm(distributeinvoice, index) {
    swal({
        title: "Do you want to remove Invoice",
        text: "\n",
        icon: "warning",
        buttons : true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            distribute.distributeInvoiceList.splice(index,1);
            refreshInvoiceInnerForm();
            if(distribute.distributeInvoiceList.length == 0){
                invoiceFlied.style.border = invalid;
                invoiceFliedLegend.style.border = invalid;
            }
        }

    });

}

function deleteCrewInnerForm(supportivecrew, index) {
    swal({
        title: "Do you want to remove Employee",
        text: "\n",
        icon: "warning",
        buttons : true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            distribute.supportiveCrewList.splice(index,1);
            refreshCrewInnerForm();
            if(distribute.supportiveCrewList.length == 0){
                supportiveCrewFlied.style.border = invalid;
                supportiveCrewFliedLegend.style.border = invalid;
            }
        }

    });

}

function setStyle(style) {
    txtDeliveryno.style.border = style;
    cmbRoute.style.border = style;
    txtTotalinvoice.style.border = style;
    cmbAgent.style.border = style;
    cmbVehicle.style.border = style;
    cmbDriver.style.border = style;
    dteDeldate.style.border = style;
    cmbDelstatus.style.border = style;
    txtDescription.style.border = style;
    dteCreateddate.style.border = style;
    cmbEmployeeCreated.style.border = style;
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

    if (distribute.distributionrouteId == null){
        errors = errors + "\n" + "Delivery Route Not Selected";
        cmbRoute.style.border = invalid;
    }
    else  addvalue = 1;

    if (distribute.totalinvoice == null){
        errors = errors + "\n" + "Total Invoice Not Enter";
        txtTotalinvoice.style.border = invalid;
    }
    else  addvalue = 1;

    if (distribute.deliveryagentId == null){
        errors = errors + "\n" + "Delivery Agent Not Selected";
        cmbAgent.style.border = invalid;
    }
    else  addvalue = 1;

    if (distribute.vehicleId == null){
        errors = errors + "\n" + "Vehicle Not Selected";
        cmbVehicle.style.border = invalid;
    }
    else  addvalue = 1;

    if (distribute.driverId == null){
        errors = errors + "\n" + "Driver Not Selected";
        cmbDriver.style.border = invalid;
    }
    else  addvalue = 1;

    if (distribute.distributiondate == null){
        errors = errors + "\n" + "Delivery Date Not Enter";
        dteDeldate.style.border = invalid;
    }
    else  addvalue = 1;

    if (distribute.distributeInvoiceList.length == 0){
        errors = errors + "\n" + "Delivery Invoice Not Selected";
        invoiceFlied.style.border = invalid;
        invoiceFliedLegend.style.border = invalid;
    }
    else  addvalue = 1;

    if (distribute.supportiveCrewList.length == 0){
        errors = errors + "\n" + "Supportive Crew Not Selected";
        supportiveCrewFlied.style.border = invalid;
        supportiveCrewFliedLegend.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;

}

function btnAddMC(){
    if(getErrors()==""){
        if(txtDescription.value==""){
            swal({
                title: "Are you sure to continue...?",
                text: "Form has some empty fields.....",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
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
            closeOnClickOutside: false,
        });

    }
}

function savedata() {
    console.log(distribute);
    swal({
        title: "Are you sure to add following Distribution Process...?" ,
        text :  "\nDelivery No : " + distribute.distributionno +
            "\nDelivery Route : " + distribute.distributionrouteId.routename +
            "\nTotal Invoice : " + distribute.totalinvoice +
            "\nDelivery Agent : " + distribute.deliveryagentId.callingname +
            "\nVehicle : " + distribute.vehicleId.vehicleno +
            "\nDriver : " + distribute.driverId.callingname+
            "\nDelivery Date : " + distribute.distributiondate +
            "\nDelivery Status : " + distribute.distributionstatusId.name +
            "\nCreated Date : " + distribute.addeddate +
            "\nCreated By : " + distribute.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/distribute", "POST", distribute);
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

    if(olddistribute == null && addvalue == ""){
        loadForm();
        selectDeleteRow();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning",
            buttons: true,
            dangerMode: true,
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

    if(olddistribute==null){
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
                }else{

                }
            });
        }
    }
}


function fillForm(dis,rowno){
    activerowno = rowno;

    clearSelection(tblDistribute);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblDistribute,activerowno,active);

    distribute = JSON.parse(JSON.stringify(dis));
    olddistribute = JSON.parse(JSON.stringify(dis));

    cmbDelstatus.removeAttribute("disabled", "disabled");

    txtDeliveryno.value = distribute.distributionno;
    txtTotalinvoice.value = distribute.totalinvoice;
    dteDeldate.value = distribute.distributiondate;
    txtDescription.value = distribute.description;
    dteCreateddate.value = distribute.addeddate;

    // chkStatus.disabled= false;

    // if (invoice.delivered == 1) {
    //     $('#chkStatus').bootstrapToggle('on');
    // } else {
    //     $('#chkStatus').bootstrapToggle('off');
    // }


    fillCombo(cmbRoute, "Select Distribute Route", distributionroutes, "routename",distribute.distributionrouteId.routename);
    fillCombo(cmbAgent, "Select Delivery Agent", deliveryagents, "callingname",distribute.deliveryagentId.callingname);
    fillCombo(cmbVehicle, "Select Vehicle", vehicles, "vehicleno",distribute.vehicleId.vehicleno);
    fillCombo(cmbDriver, "Select Driver", drivers, "callingname",distribute.driverId.callingname);

    fillCombo(cmbDelstatus, "", distributionstatuses, "name",distribute.distributionstatusId.name);
    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname", distribute.employeeId.callingname);

    refreshInvoiceInnerForm();
    if(distribute.distributeInvoiceList.length != null){
        invoiceFlied.style.border = valid;
        invoiceFliedLegend.style.border = valid;
    }else {
        invoiceFlied.style.border = invalid;
        invoiceFliedLegend.style.border = invalid;
    }

    refreshCrewInnerForm();
    if(distribute.supportiveCrewList.length != null){
        supportiveCrewFlied.style.border = valid;
        supportiveCrewFliedLegend.style.border = valid;
    }else {
        supportiveCrewFlied.style.border = invalid;
        supportiveCrewFliedLegend.style.border = invalid;
    }

    setStyle(valid);

    if (distribute.description == null) {
        txtDescription.style.border = initial;
    }


}

function getUpdates() {

    var updates = "";

    if(distribute!=null && olddistribute!=null) {
        if (distribute.distributionrouteId.routename != olddistribute.distributionrouteId.routename)
            updates = updates + "\nDelivery Route is Changed";

        if (distribute.totalinvoice != olddistribute.totalinvoice)
            updates = updates + "\nTotal Invoice is Changed";

        if (distribute.deliveryagentId.callingname != olddistribute.deliveryagentId.callingname)
            updates = updates + "\nDelivery Agent is Changed";

        if (distribute.vehicleId.vehicleno != olddistribute.vehicleId.vehicleno)
            updates = updates + "\nVehicle  is Changed";

        if (distribute.driverId.callingname != olddistribute.driverId.callingname)
            updates = updates + "\nDriver  is Changed";

        if (distribute.distributiondate != olddistribute.distributiondate)
            updates = updates + "\nDelivery Date is Changed";

        if (distribute.distributionstatusId.name != olddistribute.distributionstatusId.name)
            updates = updates + "\nDelivery Status is Changed";

        if (distribute.description != olddistribute.description)
            updates = updates + "\nDescription is Changed";

        // if(isEqual(distribute.distributeInvoiceList, olddistribute.distributeInvoiceList,"InvoiceId"))
        //     updates = updates + "\nDelivery Invoices are Changed";

        if(isEqual(distribute.supportiveCrewList, olddistribute.supportiveCrewList,"employeeId"))
            updates = updates + "\nSupportive Crew are Changed";
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
                title: "Are you sure to update following Distribution process details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/distribute", "PUT", distribute);
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
                    else swal({
                        title: 'Update not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true,
                        closeOnClickOutside: false,
                    });
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

function btnDeleteMC(dis) {
    distribute = JSON.parse(JSON.stringify(dis));

    swal({
        title: "Are you sure to delete following Distribution Process...?",
        text :  "\nDelivery No : " + distribute.distributionno +
            "\nDelivery Route : " + distribute.distributionrouteId.routename +
            "\nTotal Invoice : " + distribute.totalinvoice +
            "\nDelivery Agent : " + distribute.deliveryagentId.callingname +
            "\nVehicle : " + distribute.vehicleId.vehicleno +
            "\nDriver : " + distribute.driverId.callingname+
            "\nDelivery Date : " + distribute.distributiondate +
            "\nDelivery Status : " + distribute.distributionstatusId.name +
            "\nCreated Date : " + distribute.addeddate +
            "\nCreated By : " + distribute.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/distribute","DELETE",distribute);
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

function btnPrintTableMC(distribute) {

    var newwindow=window.open();
    formattab = tblDistribute.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Distribution Process Details</h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(disind) {
    cindex = disind;

    var disprop = tblDistribute.firstChild.firstChild.children[cindex].getAttribute('property');

    if(disprop.indexOf('.') == -1) {
        distributes.sort(
            function (a, b) {
                if (a[disprop] < b[disprop]) {
                    return -1;
                } else if (a[disprop] > b[disprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        distributes.sort(
            function (a, b) {
                if (a[disprop.substring(0,disprop.indexOf('.'))][disprop.substr(disprop.indexOf('.')+1)] < b[disprop.substring(0,disprop.indexOf('.'))][disprop.substr(disprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[disprop.substring(0,disprop.indexOf('.'))][disprop.substr(disprop.indexOf('.')+1)] > b[disprop.substring(0,disprop.indexOf('.'))][disprop.substr(disprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblDistribute',distributes,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblDistribute);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblDistribute,activerowno,active);

}

