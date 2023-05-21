window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    $(document).ready(function() {
        $('.js-example-basic-single').select2();
    });

    txtSearchname.addEventListener("keyup",btnSearchMC);

    privilages = httpRequest("../privilage?module=SUPPLIER","GET");

    //Data services for Combo Boxes
    supplierstatuses = httpRequest("../sstatus/list","GET");
    employeecreated = httpRequest("../employee/list","GET");
    items = httpRequest("../item/list","GET");

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
    suppliers = new Array();
    var data = httpRequest("/supplier/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) suppliers = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblSupplier',suppliers,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblSupplier);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblSupplier,activerowno,active);

}

function selectDeleteRow() {
    for(index in suppliers){
        if(suppliers[index].sstatusId.name =="Delete"){
            tblSupplier.children[1].children[index].style.color = "#f00";
            tblSupplier.children[1].children[index].style.fontWeight = "bold";
            tblSupplier.children[1].children[index].lastChild.children[1].disabled = true;
            tblSupplier.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(oldsupplier==null){
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

function viewitem(sup,rowno) {

    supplier = JSON.parse(JSON.stringify(sup));

    tbSnumber.innerHTML = supplier.regno;
    tbBregno.innerHTML = supplier.brnumber;
    tbSname.innerHTML = supplier.sname;
    tbSland.innerHTML = supplier.sland;
    tbSemail.innerHTML = supplier.semail;
    tbSaddress.innerHTML = supplier.address;
    tbSdescription.innerHTML = supplier.description;
    tbCPname.innerHTML = supplier.cpname;
    tbCPmobile.innerHTML = supplier.cpmobile;
    tbCPnic.innerHTML = supplier.cpnic;
    tbCPemail.innerHTML = supplier.cpemail;
    fillInnerTable("tblPrintInnerItem", supplier.supplyList,null , deleteInnerForm);
    tbPaid.innerHTML = toDecimal(supplier.tobepaid,2);
    tbBank.innerHTML = supplier.bankname;
    tbBranch.innerHTML = supplier.bankbranch;
    tbAcountno.innerHTML = supplier.bankaccount;
    tbAcountholder.innerHTML = supplier.accountholder;
    tbSupplierstatus.innerHTML = supplier.sstatusId.name;
    tbDORegister.innerHTML = supplier.regdate;
    tbEmployeeCreated.innerHTML = supplier.employeeId.callingname;

}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Supplier Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    supplier = new Object();
    oldsupplier = null;

    supplier.supplyList = new Array();

    fillCombo(cmbSupplierstatus, "", supplierstatuses, "name", "Active");
    supplier.sstatusId = JSON.parse(cmbSupplierstatus.value);

    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    supplier.employeeId = JSON.parse(cmbEmployeeCreated.value);
    cmbEmployeeCreated.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteDORegister.value=today.getFullYear()+"-"+month+"-"+date;
    supplier.regdate=dteDORegister.value;
    dteDORegister.disabled="disabled";

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/supplier/nextnumber", "GET");
    txtSnumber.value = nextNumber.regno;
    supplier.regno = txtSnumber.value;
    txtSnumber.disabled="disabled";

    cmbSupplierstatus.setAttribute("disabled", "disabled");
    $("#chkClose").prop("checked", false);

    txtBregno.value = "";
    txtSname.value = "";
    txtSland.value = "";
    txtSemail.value = "";
    txtSaddress.value = "";
    txtSdescription.value = "";
    txtCPname.value = "";
    txtCPmobile.value = "";
    txtCPnic.value = "";
    txtCPemail.value = "";
    txtBank.value = "";
    txtBranch.value = "";
    txtAcountno.value = "";
    txtAccountholder.value = "";

    setStyle(initial);
    txtSnumber.style.border=valid;
    cmbSupplierstatus.style.border=valid;
    dteDORegister.style.border=valid;
    cmbEmployeeCreated.style.border=valid;

    disableButtons(false, true, true);
    refreshInnerForm();

}

function  refreshInnerForm() {
    supply = new Object();
    oldsupply = null;

    fillCombo2(cmbItem,"Select Item",items,"itemname","");
    $('.select2-container').css('border', '3px solid #d6d6c2');

    fillInnerTable("tblInnerItem", supplier.supplyList, null , deleteInnerForm);

    if(supplier.supplyList.length != 0)
        for(var i=0; i<tblInnerItem.children[1].children.length; i++){
            tblInnerItem.children[1].children[i].lastChild.firstChild.style.display = "none";
        }
}

function innergetErrors() {
    var errors = "";
    addvalue = "";

    if (cmbItem.value == ""){
        errors = errors + "\n" + "Item Not Selected";
        cmbItem.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;
}

function btnInnerAddMC() {
    if(innergetErrors()==""){
        supply = new Object();
        supply.itemId = JSON.parse(cmbItem.value);
        itemexs = false;
        for(index in supplier.supplyList){
            if(supplier.supplyList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname){
                itemexs = true;
                break;
            }
        }

        if(itemexs){
            swal({
                title: "Item Already Exsits",
                text: "\n",
                icon: "warning",
                buttons : false,
                timer: 1200,
            })
        }else {
            supplier.supplyList.push(supply);
            refreshInnerForm();
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

function deleteInnerForm(supply, index) {
    swal({
        title: "Do you want to remove Item",
        text: "\n",
        icon: "warning",
        buttons : true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            supplier.supplyList.splice(index,1);
            refreshInnerForm();
        }

    });

}

function setStyle(style) {
    txtSnumber.style.border = style;
    txtBregno.style.border = style;
    txtSname.style.border = style;
    txtSland.style.border = style;
    txtSemail.style.border = style;
    txtSaddress.style.border = style;
    txtSdescription.style.border = style;
    txtCPname.style.border = style;
    txtCPmobile.style.border = style;
    txtCPnic.style.border = style;
    txtCPemail.style.border = style;
    txtBank.style.border = style;
    txtBranch.style.border = style;
    txtAcountno.style.border = style;
    txtAccountholder.style.border = style;
    cmbSupplierstatus.style.border = style;
    dteDORegister.style.border = style;
    cmbEmployeeCreated.style.border = style;
    //span
    hpSname.style.borderRight=style;
    hpSname.style.borderTop=style;
    hpSname.style.borderBottom=style;
    hpCPname.style.borderRight=style;
    hpCPname.style.borderTop=style;
    hpCPname.style.borderBottom=style;
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

    if (supplier.brnumber == null){
        errors = errors + "\n" + "Company Registration No Not Enter";
        txtBregno.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.sname == null){
        errors = errors + "\n" + "Supplier Name Not Enter";
        txtSname.style.border = invalid;
        hpSname.style.borderRight=invalid;
        hpSname.style.borderTop=invalid;
        hpSname.style.borderBottom=invalid;
    }
    else  addvalue = 1;

    if (supplier.sland == null){
        errors = errors + "\n" + "Supplier Land Not Enter";
        txtSland.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.semail == null){
        errors = errors + "\n" + "Supplier Email Not Enter";
        txtSemail.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.address == null){
        errors = errors + "\n" + "Supplier Address Not Enter";
        txtSaddress.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.cpname == null){
        errors = errors + "\n" + "Contact Person Name Not Enter";
        txtCPname.style.border = invalid;
        hpCPname.style.borderRight=invalid;
        hpCPname.style.borderTop=invalid;
        hpCPname.style.borderBottom=invalid;
    }
    else  addvalue = 1;

    if (supplier.cpmobile == null){
        errors = errors + "\n" + "Contact Person Mobile Not Enter";
        txtCPmobile.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.cpnic == null){
        errors = errors + "\n" + "Contact Person NIC Not Enter";
        txtCPnic.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.supplyList.length == 0){
        errors = errors + "\n" + "Item Not Selected";
        cmbItem.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.bankname == null){
        errors = errors + "\n" + "Bank Name Not Enter";
        txtBank.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.bankbranch == null){
        errors = errors + "\n" + "Branch Not Enter";
        txtBranch.style.border = invalid;
    }
    else  addvalue = 1;

    if (supplier.bankaccount == null){
        errors = errors + "\n" + "Account No Not Enter";
        txtAcountno.style.border = invalid;
    }
        else  addvalue = 1;

    if (supplier.accountholder == null){
        errors = errors + "\n" + "Account Holder Name Not Enter";
        txtAccountholder.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;

}

function btnAddMC(){
    if(getErrors()==""){
        if(txtSdescription.value=="" || txtCPnic.value==""){
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
    swal({
        title: "Are you sure to add following Supplier...?" ,
        text :  "\nSupplier Number : " + supplier.regno +
            "\nCompany Registration No : " + supplier.brnumber +
            "\nSupplier Name : " + supplier.sname +
            "\nSupplier Land : " + supplier.sland +
            "\nSupplier Email : " + supplier.semail +
            "\nSupplier Address : " + supplier.address +
            "\nContact Person Name : " + supplier.cpname+
            "\nContact Person Mobile : " + supplier.cpmobile +
            "\nContact Person NIC : " + supplier.cpnic +
            "\nSupplier Status  : " + supplier.sstatusId.name +
            "\nAdded Date : " + supplier.regdate +
            "\nAdded By : " + supplier.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/supplier", "POST", supplier);
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

    if(oldsupplier == null && addvalue == ""){
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

    if(oldsupplier==null){
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

function fillForm(sup,rowno){
    activerowno = rowno;

    clearSelection(tblSupplier);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblSupplier,activerowno,active);

    supplier = JSON.parse(JSON.stringify(sup));
    oldsupplier = JSON.parse(JSON.stringify(sup));

    cmbSupplierstatus.removeAttribute("disabled", "disabled");

    txtSnumber.value = supplier.regno;
    txtBregno.value = supplier.brnumber;
    txtSname.value = supplier.sname;
    txtSland.value = supplier.sland;
    txtSemail.value = supplier.semail;
    txtSaddress.value = supplier.address;
    txtSdescription.value = supplier.description;
    txtCPname.value = supplier.cpname;
    txtCPmobile.value = supplier.cpmobile;
    txtCPnic.value = supplier.cpnic;
    txtCPemail.value = supplier.cpemail;
    txtBank.value = supplier.bankname;
    txtBranch.value = supplier.bankbranch;
    txtAcountno.value = supplier.bankaccount;
    txtAccountholder.value = supplier.accountholder;
    cmbSupplierstatus.value = supplier.sstatusId.name;
    dteDORegister.value = supplier.regdate;

    fillCombo(cmbSupplierstatus, "", supplierstatuses, "name",supplier.sstatusId.name);
    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname", supplier.employeeId.callingname);

    refreshInnerForm();
    setStyle(valid);

    if (supplier.description == null) {
        txtSdescription.style.border = initial;
    }

    if (supplier. cpemail == null) {
        txtCPemail.style.border = initial;
    }

}

function getUpdates() {

    var updates = "";

    if(supplier!=null && oldsupplier!=null) {
        if (supplier.brnumber != oldsupplier.brnumber)
            updates = updates + "\nCompany Registration No is Changed";

        if (supplier.sname != oldsupplier.sname)
            updates = updates + "\nSupplier Name is Changed";

        if (supplier.sland != oldsupplier.sland)
            updates = updates + "\nSupplier Land is Changed";

        if (supplier.semail != oldsupplier.semail)
            updates = updates + "\nSupplier Email is Changed";

        if (supplier.address != oldsupplier.address)
            updates = updates + "\nSupplier Address is Changed";

        if (supplier.description != oldsupplier.description)
            updates = updates + "\nDescription is Changed";

        if (supplier.cpname != oldsupplier.cpname)
            updates = updates + "\nContact Person Name is Changed";

        if (supplier.cpmobile != oldsupplier.cpmobile)
            updates = updates + "\nContact Person Mobile is Changed";

        if (supplier.cpnic != oldsupplier.cpnic)
            updates = updates + "\nContact Person NIC is Changed";

        if (supplier.cpemail != oldsupplier.cpemail)
            updates = updates + "\nContact Person Email is Changed";

        if (supplier.bankname != oldsupplier.bankname)
            updates = updates + "\nBank Name is Changed";

        if (supplier.bankbranch != oldsupplier.bankbranch)
            updates = updates + "\nBranch  is Changed";

        if (supplier.bankaccount != oldsupplier.bankaccount)
            updates = updates + "\nAccount No is Changed";

        if (supplier.accountholder != oldsupplier.accountholder)
            updates = updates + "\nAccount Holder Name is Changed";

        if (supplier.sstatusId.name != oldsupplier.sstatusId.name)
            updates = updates + "\nSupplier Status is Changed";

        if(isEqual(supplier.supplyList, oldsupplier.supplyList,"itemId"))
            updates = updates + "\nSupplier Items are Changed";
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
                title: "Are you sure to update following Supplier details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/supplier", "PUT", supplier);
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

function btnDeleteMC(sup) {
    supplier = JSON.parse(JSON.stringify(sup));

    swal({
        title: "Are you sure to delete following Supplier...?",
        text :  "\nSupplier Number : " + supplier.regno +
            "\nCompany Registration No : " + supplier.brnumber +
            "\nSupplier Name : " + supplier.sname +
            "\nSupplier Land : " + supplier.sland +
            "\nSupplier Email : " + supplier.semail +
            "\nSupplier Address : " + supplier.address +
            "\nContact Person Name : " + supplier.cpname+
            "\nContact Person Mobile : " + supplier.cpmobile +
            "\nContact Person NIC : " + supplier.cpnic +
            "\nSupplier Status  : " + supplier.sstatusId.name +
            "\nAdded Date : " + supplier.regdate +
            "\nAdded By : " + supplier.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/supplier","DELETE",supplier);
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

function btnPrintTableMC(supplier) {

    var newwindow=window.open();
    formattab = tblSupplier.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Supplier Details</h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(sind) {
    cindex = sind;

    var sprop = tblSupplier.firstChild.firstChild.children[cindex].getAttribute('property');

    if(sprop.indexOf('.') == -1) {
        suppliers.sort(
            function (a, b) {
                if (a[sprop] < b[sprop]) {
                    return -1;
                } else if (a[sprop] > b[sprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        suppliers.sort(
            function (a, b) {
                if (a[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)] < b[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)] > b[sprop.substring(0,sprop.indexOf('.'))][sprop.substr(sprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblSupplier',suppliers,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblSupplier);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblSupplier,activerowno,active);

}

