window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {
    txtSearchname.addEventListener("keyup",btnSearchMC);
    txtSearchname.addEventListener("keyup",btnSearchMC);
    cmbRole.addEventListener("change",cmbRoleCH);

    userprivilages = httpRequest("../privilage?module=PRIVILAGE","GET");

    roles = httpRequest("../role/list","GET");
    modules = httpRequest("../module/list","GET");
    employeeswithuseraccount = httpRequest("../employee/list/withuseraccount","GET");

    valid = "3px solid green";
    invalid = "3px solid red";
    initial = "3px solid #d6d6c2";
    updated = "3px solid #ff9900";
    active = "#ff9900";

    loadForm();
    loadView();
    disableButtons(false, true, true);
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
    privilages = new Array();
    var data = httpRequest("/privilage/findAll?page="+page+"&size="+size+query,"GET");
    privilages = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblPrevilage',privilages,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblPrevilage);

    if(activerowno!="")selectRow(tblPrevilage,activerowno,active);
    window.location.href="#ui";
}

function paginate(page) {
    var paginate;
    if(oldprivilage==null){
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

function viewitem(pri,rowno) {

    privilage = JSON.parse(JSON.stringify(pri));

    var privi = privilage.sel == 1 ? "Select   " : ""/n;
    privi = privi + (privilage.ins == 1 ? "Insert   " : "");
    privi = privi + (privilage.upd == 1 ? "Update   " : "");
    privi = privi + (privilage.del == 1 ? "Delete   " : "");

    tbcmbRole.innerHTML = privilage.roleId.role;
    tbcmbModule.innerHTML = privilage.moduleId.name;
    tbPrivilege.innerHTML = privi;


}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Privilege Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {

    privilage = new Object();
    oldprivilage = null;

    fillCombo(cmbRole,"Select Role",roles,"role","");
    fillCombo(cmbModule,"Select Module First",modules,"name","");
    cmbRole.disabled="";
    cmbModule.disabled="";

    chkSelect.checked=false;
    chkInsert.checked=false;
    chkUpdate.checked=false;
    chkDelete.checked=false;

    $("#chkClose").prop("checked", false);

    $('#chkSelect').bootstrapToggle('off');
    $('#chkInsert').bootstrapToggle('off');
    $('#chkUpdate').bootstrapToggle('off');
    $('#chkDelete').bootstrapToggle('off');


    privilage.sel=0;
    privilage.ins=0;
    privilage.upd=0;
    privilage.del=0;

    setStyle(initial);
    disableButtons(false, true, true);

}

function setStyle(style) {
    cmbRole.style.border = style;
    cmbModule.style.border = style;
    chkSelect.parentNode.style.border = style;
    chkInsert.parentNode.style.border = style;
    chkUpdate.parentNode.style.border = style;
    chkDelete.parentNode.style.border = style;
}

function disableButtons(add, upd, del) {

    if (add || !userprivilages.add) {
        btnAdd.setAttribute("disabled", "disabled");
        $('#btnAdd').css('cursor','not-allowed');
    }
    else {
        btnAdd.removeAttribute("disabled");
        $('#btnAdd').css('cursor','pointer')
    }

    if (upd || !userprivilages.update) {
        btnUpdate.setAttribute("disabled", "disabled");
        $('#btnUpdate').css('cursor','not-allowed');
    }
    else {
        btnUpdate.removeAttribute("disabled");
        $('#btnUpdate').css('cursor','pointer');
    }

    if (!userprivilages.update) {
        $(".buttonup").prop('disabled', true);
        $(".buttonup").css('cursor','not-allowed');
    }
    else {
        $(".buttonup").removeAttr("disabled");
        $(".buttonup").css('cursor','pointer');
    }

    if (!userprivilages.delete){
        $(".buttondel").prop('disabled', true);
        $(".buttondel").css('cursor','not-allowed');
    }
    else {
        $(".buttondel").removeAttr("disabled");
        $(".buttondel").css('cursor','pointer');
    }

}

function cmbRoleCH() {
    modulesunassigned = httpRequest("../module/list/unassignedtothisrole?roleid="+JSON.parse(cmbRole.value).id,"GET");
    fillCombo(cmbModule,"Select a Module", modulesunassigned,"name","");

}



//Form Operation Functions
function getErrors() {

    var errors = "";
    addvalue = "";

    if (privilage.roleId == null){
        errors = errors + "\n" + "Roles Not Selected";
        cmbRole.style.border = invalid;
    }
    else addvalue = 1;

    if (privilage.moduleId == null){
        errors = errors + "\n" + "Module Not Selected";
        cmbModule.style.border = invalid;
    }
    else addvalue = 1;

    if (privilage.sel == 0 && privilage.ins == 0 && privilage.upd == 0 && privilage.del == 0){
        errors = errors + "\n" + "No any Privilages are Selected";
        chkSelect.parentNode.style.border = invalid;
        chkInsert.parentNode.style.border = invalid;
        chkUpdate.parentNode.style.border = invalid;
        chkDelete.parentNode.style.border = invalid;
    }
    else addvalue = 1;

    return errors;

}

function btnAddMC(){
    if(getErrors()==""){
        var privi = privilage.sel == 1 ? "Select   " : "";
        privi = privi + (privilage.ins == 1 ? "Insert   " : "");
        privi = privi + (privilage.upd == 1 ? "Update   " : "");
        privi = privi + (privilage.del == 1 ? "Delete   " : "");

        swal({
            title: "Are you sure to add a Module with following Privilages...?" ,
            text :  "\nRole : " + privilage.roleId.role +
                "\nModule : " + privilage.moduleId.name +
                "\nPrivilage : " + privi,
            icon: "warning",
            buttons: ['Cancel','Ok!'],
            closeOnClickOutside: false,
        }).then((willDelete) => {
            if (willDelete) {
                var response = httpRequest("/privilage", "POST", privilage);
                if (response == "0") {
                    swal({
                        position: 'center',
                        icon: 'success',
                        title: 'Privilege Saved SuccessFully..!',
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

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(oldprivilage == null && addvalue == ""){
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

    if(oldprivilage==null){
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
                }else{

                }
            });
        }
    }
}

function fillForm(pri,rowno){
    activerowno = rowno;

    clearSelection(tblPrevilage);
    disableButtons(true, false, false);
    selectRow(tblPrevilage,activerowno,active);

    privilage = JSON.parse(JSON.stringify(pri));
    oldprivilage = JSON.parse(JSON.stringify(pri));

    fillCombo(cmbRole, "", roles, "role", pri.roleId.role);
    fillCombo(cmbModule, "", modules , "name", pri.moduleId.name);
    cmbRole.disabled="disabled";
    cmbModule.disabled="disabled";



    if ( privilage.sel == 1) {
        $('#chkSelect').bootstrapToggle('on');
        chkSelect.checked =true;
    } else {
        $('#chkSelect').bootstrapToggle('off');
        chkSelect.checked =false;
    }
    if ( privilage.ins == 1) {
        $('#chkInsert').bootstrapToggle('on');
        chkInsert.checked =true;
    } else {
        $('#chkInsert').bootstrapToggle('off');
        chkInsert.checked =false;
    }
    if ( privilage.upd == 1) {
        $('#chkUpdate').bootstrapToggle('on');
        chkUpdate.checked =true;
    } else {
        $('#chkUpdate').bootstrapToggle('off');
        chkUpdate.checked =false;
    }
    if ( privilage.del == 1) {
        $('#chkDelete').bootstrapToggle('on');
        chkDelete.checked =true;
    } else {
        $('#chkDelete').bootstrapToggle('off');
        chkDelete.checked =false;
    }

    disableButtons(true, false, false);
    setStyle(valid);
    chkSelect.parentNode.style.border = privilage.sel == 1 ? valid : initial;
    chkInsert.parentNode.style.border = privilage.ins == 1 ? valid : initial;
    chkUpdate.parentNode.style.border = privilage.upd == 1 ? valid : initial;
    chkDelete.parentNode.style.border = privilage.del == 1 ? valid : initial;

}

function getUpdates() {

    var updates = "";

    if(privilage!=null && oldprivilage!=null) {

        if (privilage.sel != oldprivilage.sel)
            updates = updates + "\nSelect is Changed";

        if (privilage.ins != oldprivilage.ins)
            updates = updates + "\nInsert is Changed";

        if (privilage.upd != oldprivilage.upd)
            updates = updates + "\nUpdate is Changed";

        if (privilage.del != oldprivilage.del)
            updates = updates + "\nDelete is Changed";
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
                timer: 1200
            });
        else {
            swal({
                title: "Are you sure to update following Privilege details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: ['Cancel','Ok!'],
                closeOnClickOutside: false,
            })
                .then((willDelete) => {
                if (willDelete) {
                    var response = httpRequest("/privilage", "PUT", privilage);
                    if (response == "0") {
                        swal({
                            position: 'center',
                            icon: 'success',
                            title: 'Privilege Updated SuccessFully..!',
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
            title: 'You have following errors in your form', icon: "error",
            text: '\n ' + getErrors(),
            button: true,
            closeOnClickOutside: false,
        });
}

function btnDeleteMC(priv) {
    privilage = JSON.parse(JSON.stringify(priv));
    var privi = privilage.sel == 1 ? "Select   " : "";
    privi = privi + (privilage.ins == 1 ? "Insert   " : "");
    privi = privi + (privilage.upd == 1 ? "Update   " : "");
    privi = privi + (privilage.del == 1 ? "Delete   " : "");

    swal({
        title: "Are you sure to delete following Privilege...?",
        text :"\nRole : " +privilage.roleId.role+
            "\nModule : " +privilage.moduleId.name+
            "\nPrivilage : " + privi,
        icon: "warning",
        buttons: ['Cancel','Ok'],
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/privilage","DELETE",privilage);
            if (responce==0) {
                swal({
                    title: "Privilege Delete Successfully....!",
                    text: "\n",
                    icon: "success", button: false,
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


//Search Functions
function loadSearchedTable(){
    var searchtext = txtSearchname.value;

    var query ="&searchtext=";

    if(searchtext!="")
        query = "&searchtext=" + searchtext;

    loadTable(activepage, cmbPagesize.value, query);
}

function btnSearchMC(){
    activepage=1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
}

function btnPrintTableMC(privilage) {

    var newwindow=window.open();
    formattab = tblPrevilage.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>User Privilage Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(pind) {
    cindex = pind;

    var pprop = tblPrevilage.firstChild.firstChild.children[cindex].getAttribute('property');

    if(pprop.indexOf('.') == -1) {
        privilages.sort(
            function (a, b) {
                if (a[pprop] < b[pprop]) {
                    return -1;
                } else if (a[pprop] > b[pprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        privilages.sort(
            function (a, b) {
                if (a[pprop.substring(0,pprop.indexOf('.'))][pprop.substr(pprop.indexOf('.')+1)] < b[pprop.substring(0,pprop.indexOf('.'))][pprop.substr(pprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[pprop.substring(0,pprop.indexOf('.'))][pprop.substr(pprop.indexOf('.')+1)] > b[pprop.substring(0,pprop.indexOf('.'))][pprop.substr(pprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblPrevilage',privilages,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblPrevilage);

    if(activerowno!="")selectRow(tblPrevilage,activerowno,active);

}

