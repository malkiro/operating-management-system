window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);
    dteDOBirth.onchange = dteDOBirthCH;

    privilages = httpRequest("../privilage?module=EMPLOYEE","GET");

    genders = httpRequest("../gender/list","GET");
    designations = httpRequest("../designation/list","GET");
    civilstatuses = httpRequest("../civilstatus/list","GET");
    employeestatuses = httpRequest("../employeestatus/list","GET");

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
    employees = new Array();
    var data = httpRequest("/employee/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) employees = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblEmployee',employees,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblEmployee);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblEmployee,activerowno,active);

}

function selectDeleteRow() {
    for(index in employees){
        if(employees[index].employeestatusId.name =="Deleted"){
            tblEmployee.children[1].children[index].style.color = "#f00";
            tblEmployee.children[1].children[index].style.fontWeight = "bold";
            tblEmployee.children[1].children[index].lastChild.children[1].disabled = true;
            tblEmployee.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}
function paginate(page) {
    var paginate;
    if(oldemployee==null){
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

function viewitem(emp,rowno) {

    employee = JSON.parse(JSON.stringify(emp));

    tbNumber.innerHTML = employee.number;
    tbFullname.innerHTML = employee.fullname;
    tbCallingname.innerHTML = employee.callingname;
    tbNIC.innerHTML = employee.nic;
    tbGender.innerHTML = employee.genderId.name;
    tbDOBirth.innerHTML = employee.dobirth;
    if(employee.photo != null)
        imgemp.src =  atob(employee.photo);
    else
        imgitem.src =  'resourse/image/noimage.png';
    tbMobile.innerHTML = employee.mobile;
    if (employee.land != null){
        tbLand.innerHTML = employee.land;
    }
    tbAddress.innerHTML = employee.address;
    if (employee.description != null){
        tbDescription.innerHTML = employee.description;
    }
    tbCivilstatus.innerHTML = employee.civilstatusId.name;
    tbDesignation.innerHTML = employee.designationId.name;
    tbEmployeestatus.innerHTML = employee.employeestatusId.name;
    tbDOAssignment.innerHTML = employee.doassignment;
}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Employee Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    employee = new Object();
    oldemployee = null;

    fillCombo(cmbGender,"Select Gender",genders,"name","");
    fillCombo(cmbDesignation,"Select Designation",designations,"name","");
    fillCombo(cmbCivilstatus,"Select Civil Status",civilstatuses,"name","");

    fillCombo(cmbEmployeestatus,"",employeestatuses,"name","Working");
    employee.employeestatusId=JSON.parse(cmbEmployeestatus.value);


    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteDOAssignment.value=today.getFullYear()+"-"+month+"-"+date;
    employee.doassignment=dteDOAssignment.value;

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/employee/nextnumber", "GET");
    txtNumber.value = nextNumber.number;
    employee.number = txtNumber.value;
    txtNumber.disabled="disabled";
    dteDOAssignment.disabled="disabled";
    cmbEmployeestatus.disabled="disabled";

    $("#chkClose").prop("checked", false);

    txtFullname.value = "";
    txtCallingname.value = "";
    dteDOBirth.value = "";
    txtNIC.value = "";
    txtAddress.value = "";
    txtMobile.value = "";
    txtLand.value = "";
    txtDescription.value = "";

    setDefaultFile('flePhoto', employee.photo);
    // removeFile('flePhoto');

    setStyle(initial);
    cmbEmployeestatus.style.border=valid;
    dteDOAssignment.style.border=valid;
    txtNumber.style.border=valid;

    disableButtons(false, true, true);
}

function setStyle(style) {

    txtNumber.style.border = style;
    txtFullname.style.border = style;
    txtCallingname.style.border = style;
    cmbGender.style.border = style;
    cmbCivilstatus.style.border = style;
    txtNIC.style.border = style;
    dteDOBirth.style.border = style;
    photoField.style.border = style;
    txtAddress.style.border = style;
    txtMobile.style.border = style;
    txtLand.style.border = style;
    cmbDesignation.style.border = style;
    dteDOAssignment.style.border = style;
    txtDescription.style.border = style;
    cmbEmployeestatus.style.border = style;

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

function nicFieldBinder(field,pattern,ob,prop,oldob) {
    var regpattern = new RegExp(pattern);
    var val = field.value.trim();
    if (regpattern.test(val)) {
        employee.nic = val;
        gender = generate(val, field, cmbGender, dteDOBirth);
        fillCombo(cmbGender, "Select Gender", genders, "name", gender);
        employee.genderId = JSON.parse(cmbGender.value);
        employee.dobirth = dteDOBirth.value;

        if (oldemployee != null && oldemployee.nic != employee.nic) {
            // field.style.background = updated;
            field.style.border = updated;

            if (employee.genderId.name != oldemployee.genderId.name) {
                cmbGender.style.border = updated;
            }
            else {
                cmbGender.style.border = valid;
            }
            if (employee.dobirth != oldemployee.dobirth) {
                dteDOBirth.style.border = updated;
            }
            else {
                dteDOBirth.style.border = valid;
            }
        } else {
            field.style.border = valid;
            cmbGender.style.border = valid;
            dteDOBirth.style.border = valid;
        }
    }
    else {
        field.style.border = invalid;
        cmbGender.style.border = invalid;
        dteDOBirth.style.border = invalid;
        employee.nic = null;
    }

}

function dteDOBirthCH() {
    var today = new Date();
    var birthday = new Date(dteDOBirth.value);
    if((today.getTime()-birthday.getTime())>(18*365*24*3600*1000)) {
        employee.dobirth = dteDOBirth.value;
        dteDOBirth.style.border = valid;
    }
    else
    {
        employee.dobirth = null;
        dteDOBirth.style.border = invalid;
    }
}

function getErrors() {

    var errors = "";
    addvalue = "";

    if (employee.fullname == null){
        errors = errors + "\n" + "Employee Full Name Not Enter";
        txtFullname.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.callingname == null){
        errors = errors + "\n" + "Employee Calling Name Not Enter";
        txtCallingname.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.nic == null){
        errors = errors + "\n" + "Employee NIC Not Enter";
        txtNIC.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.genderId == null){
        errors = errors + "\n" + "Gender Not Selected";
        cmbGender.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.dobirth == null){
        errors = errors + "\n" + "Birth Date Not Enter";
        dteDOBirth.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.mobile == null){
        errors = errors + "\n" + "Employee Mobile Number Not Enter";
        txtMobile.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.civilstatusId == null){
        errors = errors + "\n" + "Civilstatus Not Selected";
        cmbCivilstatus.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.designationId == null){
        errors = errors + "\n" + "Designation Not Selected";
        cmbDesignation.style.border = invalid;
    }
    else  addvalue = 1;

    if (employee.address == null){
        errors = errors + "\n" + "Employee Address Not Enter";
        txtAddress.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;

}

function btnAddMC(){
    if(getErrors()==""){
        if(txtLand.value=="" || txtDescription.value ==""){
            swal({
                title: "Are you sure to continue...?",
                text: "Form has some empty fields.....",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            }).then((willDelete) => {
                if (willDelete) {
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

    swal({
        title: "Are you sure to add following Empolyee...?" ,
        text :  "\nEmployee Number : " + employee.number +
            "\nEmployee Full Name : " + employee.fullname +
            "\nEmployee Calling Name : " + employee.callingname +
            "\nEmployee NIC : " + employee.nic +
            "\nEmployee Gender : " + employee.genderId.name +
            "\nEmployee Birth Date : " + employee.dobirth +
            "\nMobile Number: " + employee.mobile +
            "\nCivil Status : " + employee.civilstatusId.name +
            "\nDesignation : " + employee.designationId.name +
            "\nAddress : " + employee.address +
            "\nEmployee Status : " + employee.employeestatusId.name +
            "\nAssignment Date : " + employee.doassignment,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/employee", "POST", employee);
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


    if(oldemployee == null && addvalue == ""){
        loadForm();
    }else{
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n" ,
            icon: "warning",
            buttons: true,
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willDelete) => {
            if (willDelete) {
                loadForm();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldemployee==null){
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



function fillForm(emp,rowno){
    activerowno = rowno;

    clearSelection(tblEmployee);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblEmployee,activerowno,active);

    employee = JSON.parse(JSON.stringify(emp));
    oldemployee = JSON.parse(JSON.stringify(emp));

    cmbEmployeestatus.removeAttribute("disabled", "disabled");

    txtNumber.value = employee.number;
    txtNumber.disabled="disabled";
    txtFullname.value = employee.fullname;
    txtCallingname.value = employee.callingname;
    dteDOBirth.value = employee.dobirth;
    txtNIC.value = employee.nic;
    txtAddress.value = employee.address;
    txtMobile.value = employee.mobile;
    txtLand.value = employee.land;
    dteDOAssignment.value = employee.doassignment;
    txtDescription.value = employee.description;

    fillCombo(cmbGender, "Select Gender", genders, "name", employee.genderId.name);
    fillCombo(cmbDesignation, "Select Designation", designations, "name", employee.designationId.name);
    fillCombo(cmbCivilstatus, "Select Civil Status", civilstatuses, "name", employee.civilstatusId.name);
    fillCombo(cmbEmployeestatus, "", employeestatuses, "name", employee.employeestatusId.name);

    setDefaultFile('flePhoto', employee.photo);

    if (employee.photo != null) {
        photoField.style.border = valid;
    }else {
        photoField.style.border = initial;
    }


    setStyle(valid);


    if (employee.land == null) {
        txtLand.style.border = initial;
        txtLand.value = "";
    }

    if (employee.description == null) {
        txtDescription.style.border = initial;
        txtDescription.value = "";
    }

}

function getUpdates() {

    var updates = "";

    if(employee!=null && oldemployee!=null) {
        if (employee.fullname != oldemployee.fullname)
            updates = updates + "\nFullname is Changed";

        if (employee.nic != oldemployee.nic)
            updates = updates + "\nNIC is Changed";

        if (employee.callingname != oldemployee.callingname)
            updates = updates + "\nCalling Name is Changed";

        if (employee.genderId.name != oldemployee.genderId.name)
            updates = updates + "\nGender is Changed";

        if (employee.civilstatusId.name != oldemployee.civilstatusId.name)
            updates = updates + "\nCivilstatus is Changed";

        if (employee.dobirth != oldemployee.dobirth)
            updates = updates + "\nDate of Birth is Changed";

        if (employee.photo != oldemployee.photo){
            updates = updates + "\nPhoto is Changed";
            photoField.style.border = updated;
        }

        if (employee.address != oldemployee.address)
            updates = updates + "\nAddress is Changed";

        if (employee.mobile != oldemployee.mobile)
            updates = updates + "\nMobile Number is Changed";

        if (employee.land != oldemployee.land)
            updates = updates + "\nLand Number is Changed";

        if (employee.designationId.name != oldemployee.designationId.name)
            updates = updates + "\nDesignation is Changed";

        if (employee.description != oldemployee.description)
            updates = updates + "\nDescription is Changed";

        if (employee.employeestatusId.name != oldemployee.employeestatusId.name)
            updates = updates + "\nEmployeestatus is Changed";
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
                title: "Are you sure to update following Empolyee details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/employee", "PUT", employee);
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

function btnDeleteMC(emp) {
    employee = JSON.parse(JSON.stringify(emp));

    swal({
        title: "Are you sure to delete following Employee...?",
        text :  "\nEmployee Number : " + employee.number +
            "\nEmployee Full Name : " + employee.fullname +
            "\nEmployee Calling Name : " + employee.callingname +
            "\nEmployee NIC : " + employee.nic +
            "\nEmployee Gender : " + employee.genderId.name +
            "\nEmployee Birth Date : " + employee.dobirth +
            "\nMobile Number: " + employee.mobile +
            "\nCivil Status : " + employee.civilstatusId.name +
            "\nDesignation : " + employee.designationId.name +
            "\nAddress : " + employee.address +
            "\nEmployee Status : " + employee.employeestatusId.name +
            "\nAssignment Date : " + employee.doassignment,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/employee","DELETE",employee);
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

function btnPrintTableMC(employee) {

    var newwindow=window.open();
    formattab = tblEmployee.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Employees Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(eind) {
    cindex = eind;

    var eprop = tblEmployee.firstChild.firstChild.children[cindex].getAttribute('property');

    if(eprop.indexOf('.') == -1) {
        employees.sort(
            function (a, b) {
                if (a[eprop] < b[eprop]) {
                    return -1;
                } else if (a[eprop] > b[eprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        employees.sort(
            function (a, b) {
                if (a[eprop.substring(0,eprop.indexOf('.'))][eprop.substr(eprop.indexOf('.')+1)] < b[eprop.substring(0,eprop.indexOf('.'))][eprop.substr(eprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[eprop.substring(0,eprop.indexOf('.'))][eprop.substr(eprop.indexOf('.')+1)] > b[eprop.substring(0,eprop.indexOf('.'))][eprop.substr(eprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblEmployee',employees,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblEmployee);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblEmployee,activerowno,active);

}