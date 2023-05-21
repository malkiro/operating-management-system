window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {
    txtSearchname.addEventListener("keyup",btnSearchMC);
    txtModelyear.addEventListener("keyup",txtModelyearKU);
    txtBrand.addEventListener("keyup",txtBrandKU);
    txtModel.addEventListener("keyup",txtModelKU);

    privilages = httpRequest("../privilage?module=ITEM","GET");

    //Data services for Combo Boxes
    vehicletypes = httpRequest("../vehicletype/list","GET");
    vehiclestatuses = httpRequest("../vehiclestatus/list","GET");
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
    vehicles = new Array();

    var data = httpRequest("/vehicle/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) vehicles = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblVehicle',vehicles,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblVehicle);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblVehicle,activerowno,active);
    console.log(vehicles);
}

function selectDeleteRow() {
    for(index in vehicles){
        if(vehicles[index].vehiclestatusId.name =="Deleted"){
            tblVehicle.children[1].children[index].style.color = "#f00";
            tblVehicle.children[1].children[index].style.fontWeight = "bold";
            tblVehicle.children[1].children[index].lastChild.children[1].disabled = true;
            tblVehicle.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(oldvehicle==null){
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

function viewitem(veh,rowno) {

    vehicle = JSON.parse(JSON.stringify(veh));

    tbBrand.innerHTML = vehicle.brand;
    tbModel.innerHTML = vehicle.model;
    tbModelyear.innerHTML = vehicle.modelyear;
    tbVname.innerHTML = vehicle.vehiclename;
    tbVNumber.innerHTML = vehicle.vehicleno;
    if(vehicle.photo != null)
        imgitem.src =  atob(vehicle.photo);
    else
        imgitem.src =  'resourse/image/noimage.png';
    tbVtype.innerHTML = vehicle.vehicletypeId.name;
    tbVstatus.innerHTML = vehicle.vehiclestatusId.name;
    tbDescription.innerHTML = vehicle.description;
    tbRegdate.innerHTML = vehicle.date;
    tbRegemployee.innerHTML = vehicle.employeeId.callingname;

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Vehicle Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    vehicle = new Object();
    oldvehicle = null;

    fillCombo(cmbVtype, "Select Type", vehicletypes, "name");

    fillCombo(cmbVstatus, "Select Vehicle Status", vehiclestatuses, "name","Available");
    vehicle.vehiclestatusId = JSON.parse(cmbVstatus.value);
    cmbVstatus.disabled="disabled";

    fillCombo(cmbRegemployee, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    vehicle.employeeId = JSON.parse(cmbRegemployee.value);
    cmbRegemployee.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    txtRegdate.value=today.getFullYear()+"-"+month+"-"+date;
    vehicle.date=txtRegdate.value;
    txtRegdate.disabled="disabled";

    $("#chkClose").prop("checked", false);


    txtBrand.value = "";
    txtModel.value = "";
    txtModelyear.value = "";
    txtDescription.value = "";
    txtVname.value = "";
    txtVname.disabled = false;
    txtVNumber.value = "";

    setDefaultFile('flePhoto', vehicle.photo);
    // removeFile('flePhoto');

    setStyle(initial);
    cmbVstatus.style.border=valid;
    txtRegdate.style.border=valid;
    cmbRegemployee.style.border=valid;

    disableButtons(false, true, true);

}

function setStyle(style) {
    txtBrand.style.border = style;
    txtModel.style.border = style;
    cmbVtype.style.border = style;
    txtModelyear.style.border = style;
    txtVNumber.style.border = style;
    txtVname.style.border = style;
    photoField.style.border = style;
    fldDescription.style.border = style;
    cmbVstatus.style.border = style;
    txtRegdate.style.border = style;
    cmbRegemployee.style.border = style;

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

function txtModelyearKU() {
    if (txtBrand.value != "" && txtModel.value != "") {
        txtVname.value = txtBrand.value+" "+ txtModel.value+" "+txtModelyear.value;
        txtVname.style.border=valid;
        txtVname.disabled="disabled";
        vehicle.vehiclename = txtVname.value;
    }


    if (oldvehicle != null){
        if(oldvehicle.modelyear == txtModelyear.value) {
            txtVname.style.border=valid;
        }else {
            txtVname.style.border=updated;
        }
    }
}

function txtBrandKU() {
    if (txtModelyear.value != "" && txtModel.value != ""){
        txtVname.value = txtBrand.value+" "+ txtModel.value+" "+txtModelyear.value;
        txtVname.style.border=valid;
        txtVname.disabled="disabled";
        vehicle.vehiclename = txtVname.value;
    }

    if (oldvehicle != null){
        if(oldvehicle.brand == txtBrand.value) {
            txtVname.style.border=valid;
        }else {
            txtVname.style.border=updated;
        }
    }
}

function txtModelKU () {
    if (txtModelyear.value != "" && txtBrand.value != ""){
        txtVname.value = txtBrand.value+" "+ txtModel.value+" "+txtModelyear.value;
        txtVname.style.border=valid;
        txtVname.disabled="disabled";
        vehicle.vehiclename = txtVname.value;
    }

    if (oldvehicle != null){
        if(oldvehicle.model == txtModel.value) {
            txtVname.style.border=valid;
        }else {
            txtVname.style.border=updated;
        }
    }
}


function getErrors() {

    var errors = "";
    addvalue = "";

    if (vehicle.brand == null){
        errors = errors + "\n" + "Vehicle Brand Not Enter";
        txtBrand.style.border = invalid;
    }
    else  addvalue = 1;

    if (vehicle.model == null){
        errors = errors + "\n" + "Vehicle Model Not Enter";
        txtModel.style.border = invalid;
    }
    else  addvalue = 1;

    if (vehicle.modelyear == null){
        errors = errors + "\n" + "Model Year Not Enter";
        txtModelyear.style.border = invalid;
    }
    else  addvalue = 1;

    if (vehicle.vehiclename == null){
        errors = errors + "\n" + "Vehicle Name Not Enter";
        txtVname.style.border = invalid;
    }
    else  addvalue = 1;

    if (vehicle.vehicleno == null){
        errors = errors + "\n" + "Vehicle Number Not Enter";
        txtVNumber.style.border = invalid;
    }
    else  addvalue = 1;

    if (vehicle.vehicletypeId == null){
        errors = errors + "\n" + "Vehicle Type Not Selected";
        cmbVtype.style.border = invalid;
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
        title: "Are you sure to add following Vehicle...?" ,
        text :  "\nVehicle Brand : " + vehicle.brand +
            "\nVehicle Model : " + vehicle.model +
            "\nModel Year : " + vehicle.modelyear +
            "\nVehicle Name : " + vehicle.vehiclename +
            "\nVehicle Number : " + vehicle.vehicleno +
            "\nVehicle Type : " + vehicle.vehicletypeId.name +
            "\nVehicle Status  : " + vehicle.vehiclestatusId.name +
            "\nRegistered Date : " + vehicle.date +
            "\nRegistered By : " + vehicle.employeeId.callingname,
        icon: "resourse/image/vehicleadd.png",
        buttons: [
            'No, Cancel',
            'Yes, Save!'
        ],
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/vehicle", "POST", vehicle);
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
                        activerowno = 1;
                        loadSearchedTable();
                    }else if($('#chkClose').prop("checked") == false){
                        $('#formmodal').modal('hide');
                        loadForm();
                        activerowno = 1;
                        loadSearchedTable();
                    }
                });

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

    if(oldvehicle == null && addvalue == ""){
        loadForm();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning",
            buttons: [true, "Yes, Discard!"],
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

    if(oldvehicle==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values or Update Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, "Yes, Discard!"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm();
                }else{

                }
            });
        }else{
            $('#formmodal').modal('hide');
            loadForm();
        }

    }
    else{
        if(getErrors()==''&&getUpdates()==''){
            $('#formmodal').modal('hide');
            loadForm();
        }else{
            swal({
                title: "Form has Some Values or Update Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, "Yes, Discard!"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    $('#formmodal').modal('hide');
                    loadForm();
                }else{

                }
            });
        }
    }
}

function fillForm(veh,rowno){
    activerowno = rowno;

    clearSelection(tblVehicle);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblVehicle,activerowno,active);

    vehicle = JSON.parse(JSON.stringify(veh));
    oldvehicle = JSON.parse(JSON.stringify(veh));

    cmbVstatus.removeAttribute("disabled", "disabled");

    txtBrand.value = vehicle.brand;
    txtModel.value = vehicle.model;
    txtModelyear.value = vehicle.modelyear;
    txtVname.value = vehicle.vehiclename;
    txtVname.disabled = true;
    txtVNumber.value = vehicle.vehicleno;
    txtDescription.value = vehicle.description;
    txtRegdate.value = vehicle.date;

    fillCombo(cmbVtype, "Select Vehicle Type", vehicletypes, "name", vehicle.vehicletypeId.name);
    fillCombo(cmbVstatus, "", vehiclestatuses, "name",vehicle.vehiclestatusId.name);
    fillCombo(cmbRegemployee, "", employeecreated, "callingname",vehicle.employeeId.callingname);

    setDefaultFile('flePhoto', vehicle.photo);

    if (vehicle.photo != null) {
        photoField.style.border = valid;
    }else {
        photoField.style.border = initial;
    }

    setStyle(valid);


    if (vehicle.description == null) {
        fldDescription.style.border = initial;
    }

}



function getUpdates() {

    var updates = "";

    if(vehicle!=null && oldvehicle!=null) {

        if (vehicle.brand != oldvehicle.brand)
            updates = updates + "\nVehicle Brand is Changed";

        if (vehicle.model != oldvehicle.model)
            updates = updates + "\nVehicle Model is Changed";

        if (vehicle.modelyear != oldvehicle.modelyear)
            updates = updates + "\nModel Year is Changed";

        if (vehicle.vehiclename != oldvehicle.vehiclename)
            updates = updates + "\nVehicle Name is Changed";

        if (vehicle.vehicleno != oldvehicle.vehicleno)
            updates = updates + "\nVehicle Number is Changed";

        if (vehicle.vehicletypeId.name != oldvehicle.vehicletypeId.name)
            updates = updates + "\nVehicle Type is Changed";

        if (vehicle.vehiclestatusId.name != oldvehicle.vehiclestatusId.name)
            updates = updates + "\nVehicle Status is Changed";

        if (vehicle.description != oldvehicle.description)
            updates = updates + "\nDescription is Changed";

        if (vehicle.photo != oldvehicle.photo){
            updates = updates + "\nPhoto is Changed";
            photoField.style.border = updated;
        }

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
                title: "Are you sure to update following Vehicle details...?",
                text: "\n"+ getUpdates(),
                icon: "resourse/image/vehicleup.png",
                buttons: ['No, Cancel', 'Yes, Update!'],
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/vehicle", "PUT", vehicle);
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
                                loadSearchedTable();
                            }else if($('#chkClose').prop("checked") == false){
                                $('#formmodal').modal('hide');
                                loadForm();
                                loadSearchedTable();
                            }
                        });

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

function btnDeleteMC(veh) {
    vehicle = JSON.parse(JSON.stringify(veh));

    swal({
        title: "Are you sure to delete following Vehicle...?",
        text :  "\nVehicle Brand : " + vehicle.vehiclename +
            "\nVehicle Model : " + vehicle.vehiclename +
            "\nModel Year : " + vehicle.vehiclename +
            "\nVehicle Name : " + vehicle.vehicleno +
            "\nVehicle Number : " + vehicle.vehicleno +
            "\nVehicle Type : " + vehicle.vehiclename +
            "\nVehicle Status  : " + vehicle.vehiclestatusId.name +
            "\nRegistered Date : " + vehicle.date +
            "\nRegistered By : " + vehicle.employeeId.callingname,
        icon: "resourse/image/vehicledel.png",
        buttons: ['No, Cancel', 'Yes, Delete it!'],
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/vehicle","DELETE",vehicle);
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
    disableButtons(false, true, true);
    selectDeleteRow();

}

function btnSearchMC(){
    activepage=1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
    disableButtons(false, true, true);
    selectDeleteRow();
}

function btnPrintTableMC(vehicle) {

    var newwindow=window.open();
    formattab = tblVehicle.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Vehicle Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(vehind) {
    cindex = vehind;

    var vprop = tblVehicle.firstChild.firstChild.children[cindex].getAttribute('property');

    if(vprop.indexOf('.') == -1) {
        vehicles.sort(
            function (a, b) {
                if (a[vprop] < b[vprop]) {
                    return -1;
                } else if (a[vprop] > b[vprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        vehicles.sort(
            function (a, b) {
                if (a[vprop.substring(0,vprop.indexOf('.'))][vprop.substr(vprop.indexOf('.')+1)] < b[vprop.substring(0,vprop.indexOf('.'))][vprop.substr(vprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[vprop.substring(0,vprop.indexOf('.'))][vprop.substr(vprop.indexOf('.')+1)] > b[vprop.substring(0,vprop.indexOf('.'))][vprop.substr(vprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblVehicle',vehicles,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblVehicle);
    disableButtons(false, true, true);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblVehicle,activerowno,active);

}


