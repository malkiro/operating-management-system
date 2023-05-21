window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);
    cmbMethod.addEventListener("change",disableField);
    cmbSupplier.addEventListener("change", cmbSupplierMC);
    txtPaidamount.addEventListener("keyup", txtPaidamountMC);

    privilages = httpRequest("../privilage?module=SPAYMENT","GET");

    //Data services for Combo Boxes
    spaymentmethods = httpRequest("../spaymentmethod/list","GET");
    suppliers = httpRequest("../supplier/paymentlist","GET");
    activesuppliers = httpRequest("../supplier/activepaymentlist","GET");
    grns = httpRequest("../grn/list","GET");
    spaymentstatus = httpRequest("../spaymentstatus/list","GET");
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
    spayments = new Array();
    var data = httpRequest("/spayment/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) spayments = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblSpayment',spayments,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblSpayment);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblSpayment,activerowno,active);

}

function selectDeleteRow() {
    for(index in spayments){
        if(spayments[index].spaymentstatusId.name =="Cancled"){
            tblSpayment.children[1].children[index].style.color = "#f00";
            tblSpayment.children[1].children[index].style.fontWeight = "bold";
            tblSpayment.children[1].children[index].lastChild.children[1].disabled = true;
            tblSpayment.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(oldspayment==null){
        paginate=true;
    }else{
        if(getErrors()==''){
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
        //loadForm();
    }

}

function viewitem(spay,rowno) {
    spayment = JSON.parse(JSON.stringify(spay));

    tbNumber.innerHTML = spayment.sbillno;
    tbMethod.innerHTML = spayment.spaymentmethodId.name;
    tbSupplier.innerHTML = spayment.supplierId.sname;
    tbTobepaid.innerHTML = toDecimal(spayment.tobepaidamount,2);
    tbPaidamount.innerHTML = toDecimal(spayment.paidamount,2);
    tbBalance.innerHTML = toDecimal(spayment.balance,2);
    tbChequeno.innerHTML = spayment.chequeno;
    tbCheque.innerHTML = spayment.chequedate;
    tbBankname.innerHTML = spayment.bankname;
    tbBranch.innerHTML = spayment.bankbranch;
    tbAccountno.innerHTML = spayment.bankaccount;
    tbAccountholder.innerHTML = spayment.accountholder;
    tbDescription.innerHTML = spayment.description;
    tbPaymentstatus.innerHTML = spayment.spaymentstatusId.name;
    tbDOPaid.innerHTML = spayment.date;
    tbEmployeePaid.innerHTML = spayment.employeeId.callingname;
}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Supplier Payment Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}



function loadForm() {
    spayment = new Object();
    oldspayment = null;

    fillCombo(cmbMethod, "Select Method", spaymentmethods, "name");

    fillCombo(cmbSupplier, "Select Supplier", activesuppliers, "sname");

    fillCombo(cmbPaymentstatus, "", spaymentstatus, "name", "Active");
    spayment.spaymentstatusId = JSON.parse(cmbPaymentstatus.value);

    fillCombo(cmbEmployeePaid, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    spayment.employeeId = JSON.parse(cmbEmployeePaid.value);
    cmbEmployeePaid.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteDOPaid.value=today.getFullYear()+"-"+month+"-"+date;
    spayment.date=dteDOPaid.value;
    dteDOPaid.disabled="disabled";

    //set min and max date
    //Cheque Date
    var twentyonedatesafterday = new Date();
    twentyonedatesafterday.setDate(today.getDate()+21);
    dteCheque.min = today.getFullYear() + "-" + month + "-" + date;
    dteCheque.max = twentyonedatesafterday.getFullYear()+"-"+getmonthdate(twentyonedatesafterday);

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/spayment/nextnumber", "GET");
    txtNumber.value = nextNumber.sbillno;
    spayment.sbillno = txtNumber.value;
    txtNumber.disabled="disabled";

    cmbPaymentstatus.setAttribute("disabled", "disabled");
    $("#chkClose").prop("checked", false);

    txtTobepaid.value = "";
    txtPaidamount.value = "";
    txtBalance.value = "";
    txtChequeno.value = "";
    dteCheque.value = "";
    txtBankname.value = "";
    txtBranch.value = "";
    txtAccountno.value = "";
    txtAccountholder.value = "";
    txtDescription.value = "";

    txtTobepaid.disabled = false;
    txtPaidamount.disabled = false;
    txtBalance.disabled = false;
    txtChequeno.disabled = false;
    dteCheque.disabled = false;
    txtBankname.disabled = false;
    txtBranch.disabled = false;
    txtAccountno.disabled = false;
    txtAccountholder.disabled = false;
    fldDescription.disabled = false;
    cmbMethod.disabled = false;
    cmbSupplier.disabled = false;

    setStyle(initial);
    txtNumber.style.border=valid;
    cmbPaymentstatus.style.border=valid;
    dteDOPaid.style.border=valid;
    cmbEmployeePaid.style.border=valid;

    disableButtons(false, true, true);

}

function setStyle(style) {
    txtNumber.style.border = style;
    cmbMethod.style.border = style;
    cmbSupplier.style.border = style;
    txtTobepaid.style.border = style;
    txtPaidamount.style.border = style;
    txtBalance.style.border = style;
    txtChequeno.style.border = style;
    dteCheque.style.border = style;
    txtBankname.style.border = style;
    txtBranch.style.border = style;
    txtAccountno.style.border = style;
    txtAccountholder.style.border = style;
    fldDescription .style.border = style;
    cmbPaymentstatus.style.border = style;
    dteDOPaid.style.border = style;
    cmbEmployeePaid.style.border = style;
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

function cmbSupplierMC() {

    txtTobepaid.value = toDecimal(spayment.supplierId.tobepaid,2);
    txtTobepaid.style.border = valid;
    spayment.tobepaidamount = txtTobepaid.value;
    txtTobepaid.disabled = true;

    if (spayment.spaymentmethodId.id == 3){
        txtBankname.value = spayment.supplierId.bankname;
        txtBankname.style.border = valid;
        spayment.bankname = txtBankname.value;

        txtBranch.value = spayment.supplierId.bankbranch;
        txtBranch.style.border = valid;
        spayment.bankbranch = txtBranch.value;

        txtAccountno.value = spayment.supplierId.bankaccount;
        txtAccountno.style.border = valid;
        spayment.bankaccount = txtAccountno.value;

        txtAccountholder.value = spayment.supplierId.accountholder;
        txtAccountholder.style.border = valid;
        spayment.accountholder = txtAccountholder.value;
    }

}

function txtPaidamountMC() {
    txtBalance.value = (parseFloat(txtTobepaid .value) - parseFloat(txtPaidamount.value)).toFixed(2);
    txtBalance.style.border = valid;
    spayment.balance = txtBalance.value;
}

function disableField() {
    if (spayment.spaymentmethodId.id == 1) {
        txtChequeno.setAttribute("disabled", "disabled");
        dteCheque.setAttribute("disabled", "disabled");
        txtBankname.setAttribute("disabled", "disabled");
        txtBranch.setAttribute("disabled", "disabled");
        txtAccountno.setAttribute("disabled", "disabled");
        txtAccountholder.setAttribute("disabled", "disabled");

        txtBankname.value = "";
        txtBranch.value = "";
        txtAccountno.value = "";
        txtAccountholder.value = "";

        txtBankname.style.border = initial;
        txtBranch.style.border = initial;
        txtAccountno.style.border = initial;
        txtAccountholder.style.border = initial;

    }
    else

    if (spayment.spaymentmethodId.id == 2)
    {
        txtChequeno.removeAttribute("disabled", "disabled");
        dteCheque.removeAttribute("disabled", "disabled");
        txtBankname.setAttribute("disabled", "disabled");
        txtBranch.setAttribute("disabled", "disabled");
        txtAccountno.setAttribute("disabled", "disabled");
        txtAccountholder.setAttribute("disabled", "disabled");

        $('#collapseOne').collapse({
            toggle: true
        });


        txtBankname.value = "";
        txtBranch.value = "";
        txtAccountno.value = "";
        txtAccountholder.value = "";

        txtBankname.style.border = initial;
        txtBranch.style.border = initial;
        txtAccountno.style.border = initial;
        txtAccountholder.style.border = initial;

    }
    else{
        if(cmbSupplier.value != ""){
            txtBankname.value = spayment.supplierId.bankname;
            txtBankname.style.border = valid;
            spayment.bankname = txtBankname.value;

            txtBranch.value = spayment.supplierId.bankbranch;
            txtBranch.style.border = valid;
            spayment.bankbranch = txtBranch.value;

            txtAccountno.value = spayment.supplierId.bankaccount;
            txtAccountno.style.border = valid;
            spayment.bankaccount = txtAccountno.value;

            txtAccountholder.value = spayment.supplierId.accountholder;
            txtAccountholder.style.border = valid;
            spayment.accountholder = txtAccountholder.value;
        }

        txtChequeno.setAttribute("disabled", "disabled");
        dteCheque.setAttribute("disabled", "disabled");
        txtBankname.removeAttribute("disabled", "disabled");
        txtBranch.removeAttribute("disabled", "disabled");
        txtAccountno.removeAttribute("disabled", "disabled");
        txtAccountholder.removeAttribute("disabled", "disabled");

        $('#collapseTwo').collapse({
            toggle: true
        });

    }

}


function getErrors() {
    var errors = "";
    addvalue = "";


    if (spayment.spaymentmethodId== null){
        errors = errors + "\n" + "Payment Method Not Selected";
        cmbMethod.style.border = invalid;
    }
    else  addvalue = 1;

    if (spayment.supplierId== null){
        errors = errors + "\n" + "Supplier  Not Selected";
        cmbSupplier.style.border = invalid;
    }
    else  addvalue = 1;

    if (spayment.tobepaidamount== null){
        errors = errors + "\n" + "Total Amount  Not Enter";
        txtTobepaid.style.border = invalid;
    }
    else  addvalue = 1;

    if (spayment.paidamount == null){
        errors = errors + "\n" + "Paid Amount Not Enter";
        txtPaidamount.style.border = invalid;
    }
    else  addvalue = 1;

    if (spayment.balance == null){
        errors = errors + "\n" + "Balance  Not Enter";
        txtBalance.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;
}

function btnAddMC(){
    if(getErrors()==""){
        if(txtChequeno.value=="" || dteCheque.value=="" || txtBankname.value=="" || txtBranch.value=="" || txtAccountno.value=="" || txtAccountholder.value=="" || txtDescription.value==""){
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
        title: "Are you sure to add following Supplier Payment...?" ,
        text :  "\nSupplier Payment Number : " + spayment.sbillno +
            "\nPayment Method : " + spayment.spaymentmethodId.name +
            "\nSupplier : " + spayment.supplierId.sname +
            "\nTotal Amount : " + spayment.tobepaidamount +
            "\nPaid Amount : " + spayment.paidamount+
            "\nBalance : " + spayment.balance +
            "\nPayment Status : " + spayment.spaymentstatusId.name +
            "\nPaid Date  : " + spayment.date +
            "\nPaid By : " + spayment.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/spayment", "POST", spayment);
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
    checkerr = getErrors();

    if(oldspayment == null && addvalue == ""){
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

    if(oldspayment==null){
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
        if(getErrors()==''){
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


function fillForm(spay,rowno){
    activerowno = rowno;


    clearSelection(tblSpayment);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblSpayment,activerowno,active);

    spayment = JSON.parse(JSON.stringify(spay));
    oldspayment = JSON.parse(JSON.stringify(spay));

    txtNumber.value = spayment.sbillno;
    txtTobepaid.value = spayment.tobepaidamount;
    txtPaidamount.value = spayment.paidamount;
    txtBalance.value = spayment.balance;
    txtChequeno.value = spayment.chequeno;
    dteCheque.value = spayment.chequedate;
    txtBankname.value = spayment.bankname;
    txtBranch.value = spayment.bankbranch;
    txtAccountno.value = spayment.bankaccount;
    txtAccountholder.value = spayment.accountholder;
    txtDescription.value = spayment.description;
    dteDOPaid.value = spayment.date;

    txtTobepaid.disabled = true;
    txtPaidamount.disabled = true;
    txtBalance.disabled = true;
    txtChequeno.disabled = true;
    dteCheque.disabled = true;
    txtBankname.disabled = true;
    txtBranch.disabled = true;
    txtAccountno.disabled = true;
    txtAccountholder.disabled = true;
    fldDescription.disabled = true;
    cmbMethod.disabled = true;
    cmbSupplier.disabled = true;

    fillCombo(cmbMethod, "", spaymentmethods, "name",spayment.spaymentmethodId.name);
    fillCombo(cmbSupplier, "", suppliers, "sname", spayment.supplierId.sname);
    fillCombo(cmbPaymentstatus, "", spaymentstatus, "name",spayment.spaymentstatusId.name);
    fillCombo(cmbEmployeePaid, "", employeecreated, "callingname", spayment.employeeId.callingname);

    setStyle(valid);

    if (spayment.chequeno == null) {
        txtChequeno.style.border = initial;
    }

    if (spayment. chequedate == null) {
        dteCheque.style.border = initial;
    }

    if (spayment.bankname == null) {
        txtBankname.style.border = initial;
    }

    if (spayment. bankbranch == null) {
        txtBranch.style.border = initial;
    }

    if (spayment.bankaccount == null) {
        txtAccountno.style.border = initial;
    }

    if (spayment.accountholder == null) {
        txtAccountholder.style.border = initial;
    }

    if (spayment.description == null) {
        fldDescription.style.border = initial;
    }
}

function btnDeleteMC(spay) {
    spayment = JSON.parse(JSON.stringify(spay));

    swal({
        title: "Are you sure to delete following Supplier Payment...?",
        text :  "\nBill Number : " + spayment.sbillno +
            "\nPayment Method : " + spayment.spaymentmethodId.name +
            "\nSupplier : " + spayment.supplierId.sname +
            "\nTotal Amount : " + spayment.tobepaidamount +
            "\nPaid Amount : " + spayment.paidamount+
            "\nBalance : " + spayment.balance +
            "\nPayment Status : " + spayment.spaymentstatusId.name +
            "\nPaid Date  : " + spayment.date +
            "\nPaid By : " + spayment.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/spayment","DELETE",spayment);
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

function btnPrintTableMC(spayment) {

    var newwindow=window.open();
    formattab = tblSpayment.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Supplier Payment Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(spind) {
    cindex = spind;

    var spprop = tblSpayment.firstChild.firstChild.children[cindex].getAttribute('property');

    if(spprop.indexOf('.') == -1) {
        spayments.sort(
            function (a, b) {
                if (a[spprop] < b[spprop]) {
                    return -1;
                } else if (a[spprop] > b[spprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        spayments.sort(
            function (a, b) {
                if (a[spprop.substring(0,spprop.indexOf('.'))][spprop.substr(spprop.indexOf('.')+1)] < b[spprop.substring(0,spprop.indexOf('.'))][spprop.substr(spprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[spprop.substring(0,spprop.indexOf('.'))][spprop.substr(spprop.indexOf('.')+1)] > b[spprop.substring(0,spprop.indexOf('.'))][spprop.substr(spprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblSpayment',spayments,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblSpayment);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblSpayment,activerowno,active);
}

