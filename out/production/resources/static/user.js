window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {
    $('.js-example-placeholder-multiple').select2(
        {
            placeholder: "Select User Roles",
            allowClear: true
        }
    );

    txtSearchname.addEventListener("keyup",btnSearchMC);
    txtPassword.addEventListener("keyup",txtPasswordKU);
    txtRetypePassword.addEventListener("keyup",txtRetypePasswordKU);

    privilages = httpRequest("../privilage?module=USER","GET");
    // changepasswordprivilages = httpRequest("../privilages?module=USERPASSWORDCHANGE","GET");


    employeeswithoutusers = httpRequest("../employee/list/withoutusers","GET");
    employees = httpRequest("../employee/list","GET");
    roleslist = httpRequest("../role/list","GET");

    //apply selecr2 into your select box
    $(".js-example-basic-multiple").select2({
        placeholder: " Select a Roles",
        allowClear: true
    });

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
    users = new Array();
    var data = httpRequest("/user/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) users = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblUser',users,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblUser);
    selectDeleteRow();
    if(activerowno!="")selectRow(tblUser,activerowno,active);
    window.location.href="#ui";

}

function selectDeleteRow() {
    for(index in users){
        console.log(users[index].active)
        if(users[index].active == false){
            tblUser.children[1].children[index].style.color = "#f00";
            tblUser.children[1].children[index].style.fontWeight = "bold";
            tblUser.children[1].children[index].lastChild.children[1].disabled = true;
            tblUser.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(olduser==null){
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

function viewitem(usr,rowno) {

    user = JSON.parse(JSON.stringify(usr));

    var rolelist ="";
    for(index in user.roles){
        rolelist += user.roles[index].role + ",";
    }

    var status = "In-Active";
    if(user.active)
        status = "Active";

    tbcmbEmployee.innerHTML = user.employeeId.callingname;
    tbUsername.innerHTML = user.userName;
    tbEmail.innerHTML = user.email;
    tbchkStatus.innerHTML = status;
    tbcmbUserRoles.innerHTML = rolelist;
    if (user.description != null){
        tbDescription.innerHTML = user.description;

    }
    tbdteDOCreated.innerHTML = user.docreation;
    tbcmbEmployeeCreated.innerHTML = user.employeeCreatedId.callingname;

}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>User Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {

    user = new Object();
    olduser = null;
    user.roles = new Array();

    fillCombo(cmbEmployee,"Select Employee",employeeswithoutusers,"callingname",session.getObject('activeuser').employeeId.callingname);
    fillCombo(cmbEmployeeCreated,"Loged Employee",employees,"callingname","Admin");
    fillCombo2(cmbUserRoles,"",roleslist,"role","");

    //chkStatus.checked = "checked";
    $('#chkStatus').bootstrapToggle('on');
    chkStatus.disabled = "disabled";
    user.active = true;

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteDOCreated.value=today.getFullYear()+"-"+month+"-"+date;
    user.docreation=dteDOCreated.value;
    dteDOCreated.disabled = "disabled";

    user.employeeCreatedId=JSON.parse(cmbEmployeeCreated.value);
    cmbEmployeeCreated.disabled = "disabled";
    //user.userstatusId=JSON.parse(cmbUserstatus.value);

    $("#chkClose").prop("checked", false);

    txtUsername.value = "";
    txtPassword.value = "";
    txtRetypePassword.value = "";
    txtEmail.value = "";
    txtDescription.value = "";

    cmbEmployee.disabled = false;
    txtUsername.disabled = false;
    txtPassword.disabled = false;
    txtRetypePassword.disabled = false;

    setStyle(initial);
    chkStatus.style.border = valid;
    dteDOCreated.style.border=valid;
    cmbEmployeeCreated.style.border = valid;
    $('.select2-selection').css('border', initial);

    disableButtons(false, true, true);

}

function setStyle(style) {
    txtUsername.style.border = style;
    txtPassword.style.border = style;
    txtRetypePassword.style.border = style;
    cmbEmployee.style.border = style;
    txtEmail.style.border = style;
    chkStatus.style.border = style;
    dteDOCreated .style.border = style;
    fldDescription.style.border = style;
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

function txtPasswordKU() {
    txtRetypePassword.value="";
    txtRetypePassword.style.border = initial;
}

function txtRetypePasswordKU() {
    var pattern = new RegExp(txtPassword.getAttribute('data-pattern'));
    var password = txtPassword.value;
    var retypepassword = txtRetypePassword.value;
    if(pattern.test(password) && password==retypepassword) {
        user.password = password;
        txtRetypePassword.style.border = valid;
    }
    else
    {
        user.password = null;
        txtRetypePassword.style.border = invalid;
    }
}



//Form Operation Functions
function getErrors() {

    var errors = "";
    addvalue = "";

    if (user.employeeId == null){
        errors = errors + "\n" + "Employee Not Selected";
        cmbEmployee.style.border = invalid;
    }
    else  addvalue = 1;

    if (user.userName == null){
        errors = errors + "\n" + "User Name Not Entered";
        txtUsername.style.border = invalid;
    }
    else  addvalue = 1;

    if (user.password == null){
        errors = errors + "\n" + "Password Not Inserted or Mismatch";
        txtPassword.style.border = invalid;
        txtRetypePassword.style.border = invalid;
    }
    else  addvalue = 1;

    if (user.email == null){
        errors = errors + "\n" + "Email Not Entered";
        txtEmail.style.border = invalid;
    }
    else  addvalue = 1;

    if (user.roles.length == 0){
        errors = errors + "\n" + "Roles Not Selected";
        $('.select2-selection').css('border',invalid);
        $('.select2-selection').css('borderWidth', '3px');
    }
    else  addvalue = 1;

    // if (user.roleslist == 0){
    //     errors = errors + "\n" + "Roles Not Selected";
    // }
    // else  addvalue = 1;

    return errors;
}

function btnAddMC(){
    errors = getErrors();

    if (errors == "") {

        if (txtDescription.value == "") {
            swal({
                title: "Some fields are empty. Do you want to continue...?",
                icon: "warning",
                buttons: [true, " Yes !"],
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((ok) => {
                if (ok) {
                    savedata();

                }
            });
        } else {
            savedata();
        }


    }
    else{
        //  alert("yu have following errors \n"+getErrors());
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
    var rolelist ="";
    for(index in user.roles){
        rolelist += user.roles[index].role + ",";
    }

    var status = "In-Active";
    if(user.active)
        status = "Active";

    swal({
        title: "Are you sure Add Following Employee",
        text: "Employee   : " + user.employeeId.callingname + "\n"+
            "Username : " + user.userName + "\n"+
            "User ID (Email)  : " + user.email + "\n"+
            "Status   : " + status + "\n"+
            "User Roles  : " + rolelist + "\n"+
            "User Created Date  : " + user.docreation + "\n"+
            "Employee Created  : " + user.employeeCreatedId.callingname + "\n",
        icon: "warning",
        buttons: [true, " OK"],
        dangerMode: false,
        closeOnClickOutside: false,
    }).then((willAdd) => {
        if (willAdd) {
            var response = httpRequest("/user", "POST", user);
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

    if(olduser == null && addvalue == ""){
        loadForm();
        selectDeleteRow();
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
                selectDeleteRow();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(olduser==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values or Update Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
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
                buttons: [true, " Yes ! Discard"],
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


function fillForm(usr,rowno){
    activerowno = rowno;

    clearSelection(tblUser);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblUser,activerowno,active);

    user = JSON.parse(JSON.stringify(usr));
    olduser = JSON.parse(JSON.stringify(usr));

    // fill combo 2
    fillCombo2(cmbUserRoles,"",roleslist,"role",user.roles);
    $('.select2-selection').css('border','3px solid green');

    txtUsername.value = user.userName;
    dteDOCreated.value = user.docreation;
    txtDescription.value = user.description;
    txtEmail.value = user.email;
    txtUsername.disabled="disabled";
    txtPassword.value = "";
    txtPassword.disabled="disabled";
    txtRetypePassword.disabled="disabled";
    dteDOCreated.disabled="disabled";

    chkStatus.disabled= false;
    if (user.active == 1) {
        chkStatus.checked = true;
        $('#chkStatus').bootstrapToggle('on')
        chkStatus.style.border = valid;
    } else {
        chkStatus.checked = false;
        $('#chkStatus').bootstrapToggle('off')
        chkStatus.style.border = valid;
    }

    fillCombo(cmbEmployee, "", employees, "callingname", user.employeeId.callingname);

    fillCombo(cmbEmployeeCreated, "", employees, "callingname", user.employeeCreatedId.callingname);
    cmbEmployee.disabled="disabled";
    cmbEmployeeCreated.disabled="disabled";


    setStyle(valid);

    if (user.description == null) {
        fldDescription.style.border = initial;
        txtDescription.value="";
    }

}

function getUpdates() {

    var updates = "";

    if(user!=null && olduser!=null) {

        if (isEqualtolist(user.roles, olduser.roles, 'role'))
            updates = updates + "\nRoles are Changed";

        if (user.email != olduser.email)
            updates = updates + "\nUser ID (Email) is Changed";

        if (user.description != olduser.description)
            updates = updates + "\nDescription is Changed";

        if (user.active != olduser.active)
            updates = updates + "\n Status is Changed" ;

    }

    return updates;

}

function btnUpdateMC() {
    console.log(user.active);
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
                title: "Are you sure to update following User details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/user", "PUT", user);
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


function btnDeleteMC(uer) {
    user = JSON.parse(JSON.stringify(uer));

    var rolelist ="";
    for(index in user.roles){
        rolelist += user.roles[index].role + ",";
    }

    var status = "In-Active";
    if(user.active)
        status = "Active";

    swal({
        title: "Are you sure to delete following User...?",
        text: "Employee   : " + user.employeeId.callingname + "\n"+
            "Username : " + user.userName + "\n"+
            "User ID (Email)  : " + user.email + "\n"+
            "Status   : " + status + "\n"+
            "User Roles  : " + rolelist + "\n"+
            "User Created Date  : " + user.docreation + "\n"+
            "Employee Created  : " + user.employeeCreatedId.callingname + "\n",
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var response = httpRequest("/user","DELETE",user);
            if(response=="0"){
                swal({
                    title: "Deleted Successfully....!",
                    text: "\n\n  Status change to delete",
                    icon: "success",
                    button: false,
                    timer: 1200,
                });
                employeeswithoutusers = httpRequest("../datalists/employeeswithoutusers","GET");
                loadForm();
                loadSearchedTable();

            }
            else{
                swal({
                    title: "You have following erros....!",
                    text: "\n\n" + response,
                    icon: "error",
                    button: true,
                    closeOnClickOutside: false,
                });
            }
        }

    });

}


//Search Functions
function loadSearchedTable(){

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


function btnPrintTableMC(user) {
    var newwindow=window.open();
    formattab = tblUser.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>User Details</h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}


function sortTable(uind) {
    cindex = uind;

    var uprop = tblUser.firstChild.firstChild.children[cindex].getAttribute('property');

    if(uprop.indexOf('.') == -1) {
        users.sort(
            function (a, b) {
                if (a[uprop] < b[uprop]) {
                    return -1;
                } else if (a[uprop] > b[uprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        users.sort(
            function (a, b) {
                if (a[uprop.substring(0,uprop.indexOf('.'))][uprop.substr(uprop.indexOf('.')+1)] < b[uprop.substring(0,uprop.indexOf('.'))][uprop.substr(uprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[uprop.substring(0,uprop.indexOf('.'))][uprop.substr(uprop.indexOf('.')+1)] > b[uprop.substring(0,uprop.indexOf('.'))][uprop.substr(uprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblUser',users,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblUser);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblUser,activerowno,active);
}


//Customer binder
function customBinder() {
    var value = $('.js-example-placeholder-multiple').val();
    //console.log(value);

    user.roles = new Array();
    // //item = "{"id":2, "name":"Singal"}"
    value.forEach(function (item) {
        eval('var obj=' + item);
        user.roles.push(obj);
    });
    console.log("Roles ", user.roles);
    //$('.select2-selection').css('border',validBorder);
    //$('.select2-selection').css('background',valid);

    if(user.roles.length != 0){
        if (olduser != null && isEqualtolist(user.roles, olduser.roles, 'role')) {
            $('.select2-selection').css('border', updated);
            $('.select2-selection').css('borderWidth', '3px');

        } else {
            $('.select2-selection').css('border', valid);
            $('.select2-selection').css('borderWidth', '3px');
        }
    }
    else{
        $('.select2-selection').css('border',invalid);
        $('.select2-selection').css('borderWidth', '3px');
    }
}
