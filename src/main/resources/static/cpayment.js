window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    $(document).ready(function() {
        $('.js-example-basic-single').select2();
    });

    txtSearchname.addEventListener("keyup",btnSearchMC);
    cmbCustomer.addEventListener("change", cmbCustomerMC);
    cmbInvoice.addEventListener("change", cmbInvoiceMC);
    cmbPaymentMethod.addEventListener("change", cmbPaymentMethodMC);
    txtRecievedAmount.addEventListener("keyup", txtRecievedAmountKU);
    txtApply.addEventListener("change", txtApplyKU);

    privilages = httpRequest("../privilage?module=CPAYMENT","GET");

    //Data services for Combo Boxes
    cpmethods = httpRequest("../cpmethod/list","GET");
    customers = httpRequest("../customer/invoicelist","GET");
    activecustomers = httpRequest("../customer/activeinvoicelist","GET");
    invoices = httpRequest("../invoice/cpaymentlist","GET");
    cpaymentstatuses = httpRequest("../cpaymentstatus/list","GET");
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
    cpayments = new Array();
    var data = httpRequest("/cpayment/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) cpayments = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblCpayment',cpayments,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblCpayment);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblCpayment,activerowno,active);
}

function selectDeleteRow() {
    for(index in cpayments){
            tblCpayment.children[1].children[index].lastChild.children[0].style.display ="none";
            tblCpayment.children[1].children[index].lastChild.children[1].style.display ="none";
            tblCpayment.children[1].children[index].lastChild.children[2].style.marginLeft = "60px";

    }
}

function paginate(page) {
    var paginate;
    if(oldcpayment==null){
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
        activerowno=""
        loadSearchedTable();
        loadForm();
    }
}

function viewitem(cpay,rowno) {
    if (rowno!=0)
        cpayment= JSON.parse(JSON.stringify(cpay));
    else  cpayment=cpay;

    var today = new Date();
    var month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = today.getDate();
    if (date < 10) date = "0" + date;
console.log(cpayment)
    tbNumber.innerHTML = cpayment.cbillno;
    tbRecievedDate.innerHTML = cpayment.recieveddate;
    tbCusId.innerHTML = cpayment.customerId.regno;
    tbCustomer.innerHTML = cpayment.customerId.cname;
    tbCAddress.innerHTML = cpayment.customerId.address;
    // tbCMobile.innerHTML = cpayment.customerId.cmobile;
    // tbRoute.innerHTML = cpayment.customerId.distributionrouteId.routename;
    tbEmail.innerHTML = cpayment.customerId.cemail;
    tbRep.innerHTML = session.getObject("loginuser").loginusername;
    tbPrintDate.innerHTML = today.getFullYear() + "-" + month + "-" + date;

    fillInnerTable("tblPrintInnerIvoice", cpayment.cpaymentInvoiceList, null , deleteInvoiceInnerForm);
    fillInnerTable("tblPrintInnerMethod", cpayment.cpaymentMethodList, mdifyCpMethodInnerForm , deleteCpMethodInnerForm);

    tbDescription.innerHTML = cpayment.description;
    tbArrears.innerHTML = toDecimal(cpayment.oldbalance,2);
    tbRecievedAmount.innerHTML = toDecimal(cpayment.totalamount,2);
    tbNewArrears.innerHTML = toDecimal(cpayment.newbalance,2);

}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        // "<div style='margin-top: 100px'><h1>Customer Payment Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}




function loadForm() {
    cpayment = new Object();
    oldcpayment = null;

    cpayment.cpaymentInvoiceList = new Array();
    cpayment.cpaymentMethodList = new Array();

    fillCombo3(cmbCustomer,"Select Customer",activecustomers,"regno","cname","");
    $('.select2-container').css('border', '3px solid #d6d6c2');

    fillCombo(cmbCpaymentstatus, "", cpaymentstatuses, "name", "Pending");
    cpayment.cpaymentstatusId = JSON.parse(cmbCpaymentstatus.value);

    fillCombo(cmbEmployeecreated, "", employeecreated, "callingname", session.getObject('activeuser').employeeId.callingname);
    cpayment.employeeId = JSON.parse(cmbEmployeecreated.value);
    cmbEmployeecreated.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    txtRecievedDate.value=today.getFullYear()+"-"+month+"-"+date;
    cpayment.recieveddate=txtRecievedDate.value;
    txtRecievedDate.disabled="disabled";

    //set min and max date
    //Cheque Date
    var twentyonedatesafterday = new Date();
    twentyonedatesafterday.setDate(today.getDate()+21);
    dteCheque.min = today.getFullYear() + "-" + month + "-" + date;
    dteCheque.max = twentyonedatesafterday.getFullYear()+"-"+getmonthdate(twentyonedatesafterday);


    cmbCpaymentstatus.setAttribute("disabled", "disabled");
    spnNumber.style.visibility="hidden";
    $("#chkClose").prop("checked", false);

    txtNumber.value = "";
    txtNumber.disabled = true;
    txtTotalCashChequeAmount.value = "";
    txtTotalCashChequeAmount.disabled = false;
    txtDescription.value = "";
    txtArrears.value = "";
    txtArrears.disabled = false;
    txtNewArrears.value = "";
    txtNewArrears.disabled = true;
    txtMobile.value = "";
    txtMobile.disabled = false;
    txtRoute.value = "";
    txtRoute.disabled = false;
    txtCreditLimit.value = "";
    txtCreditLimit.disabled = false;
    txtRecievedAmount.value = "";
    txtRecievedAmount.disabled = false;



    setStyle(initial);
    txtNumber.style.border=initial;
    txtRecievedAmount.style.border=initial;
    txtAvailableamount.style.border=initial;
    cmbCpaymentstatus.style.border=valid;
    txtRecievedDate.style.border=valid;
    cmbEmployeecreated.style.border=valid;
    invoiceFlied.style.border = initial;
    invoiceFliedLegend.style.border = initial;
    methodFlied.style.border = initial;
    methodFliedLegend.style.border = initial;

    $("#invoiceBox").show();
    $("#btnInnerInvoice").show();
    $("#methodBox").show();
    $("#btnInnerMethod").show();

    disableButtons(false, true, true);
    cmbInvoice.disabled = true;

    refreshInvoicesInnerForm();
    refreshMethodsInnerForm();
    txtAvailableamount.value = "";
}


//InvoiceField
function refreshInvoicesInnerForm() {
    cpaymentinvoice  = new Object();
    oldcpaymentinvoice = null;

    total = toDecimal(txtRecievedAmount.value,2);

    fillCombo(cmbInvoice, "Select Invoice", invoices, "invoiceno");
    cmbInvoice.style.border = initial;

    dteInvoicedate.value = "";
    dteInvoicedate.style.border = initial;
    dteInvoicedate.disabled = false;

    txtInvoiceamount.value = "";
    txtInvoiceamount.style.border = initial;
    txtInvoiceamount.disabled = false;

    txtOutstanding.value = "";
    txtOutstanding.style.border = initial;
    txtOutstanding.disabled = false;

    txtApply.value = "";
    txtApply.style.border = initial;
    txtApply.disabled = false;

    txtArrears.disabled = false;
    txtMobile.disabled = false;
    txtRoute.disabled = false;
    txtCreditLimit.disabled = false;
    txtDescription.disabled = false;
    cmbCustomer.disabled = false;

    fillInnerTable("tblInnerInvoices", cpayment.cpaymentInvoiceList, null , deleteInvoiceInnerForm);

    if (cpayment.cpaymentInvoiceList.length != 0) {
        for (index in cpayment.cpaymentInvoiceList){
            total = parseFloat(total) - parseFloat(cpayment.cpaymentInvoiceList[index].applingamount);
        }

        txtAvailableamount.value = parseFloat(total).toFixed(2);
        txtAvailableamount.style.border = valid;
    }else {
        txtAvailableamount.value = toDecimal(txtRecievedAmount.value,2);
    }

    if(cpayment.cpaymentInvoiceList.length != 0)
        for(var i=0; i<tblInnerInvoices.children[1].children.length; i++){
            tblInnerInvoices.children[1].children[i].lastChild.firstChild.style.display = "none";
        }


    btnInnerInvoiceAdd.removeAttribute("disabled", "disabled");
    $('#btnInnerInvoiceAdd').css('cursor','pointer');
}

function innerinvoicegetErrors() {
    var errors = "";
    addvalue = "";

    if (cmbInvoice.value == ""){
        errors = errors + "\n" + "Invoice No  Not Selected";
        cmbInvoice.style.border = invalid;
    }
    else  addvalue = 1;

    if (dteInvoicedate.value == ""){
        dteInvoicedate.style.border = invalid;
        errors = errors + "\n" + "Invoice Date  Not Enter";
    }
    else  addvalue = 1;

    if (txtInvoiceamount.value == ""){
        txtInvoiceamount.style.border = invalid;
        errors = errors + "\n" + "Invoice Amount  Not Enter";
    }
    else  addvalue = 1;

    if (txtOutstanding.value == ""){
        errors = errors + "\n" + "Outstanding Not Enter";
        txtOutstanding.style.border = invalid;
    }
    else  addvalue = 1;

    if (txtApply .value == ""){
        txtApply .style.border = invalid;
        errors = errors + "\n" + "Applying Amount  Not Enter";
    }
    else  addvalue = 1;

    return errors;
}

function btnInvoiceInnerAddMC() {
    txtRecievedAmount.disabled = true;
    if(innerinvoicegetErrors()==""){

        if (isNaN(parseFloat(txtApply.value))){
            txtApply.value = "";
            txtApply.style.border = invalid;
            swal({
                title: "Applying Amount is not allowed",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }else {
            if (parseFloat(txtApply.value) < 0) {
                txtApply.value = "";
                txtApply.style.border = invalid;
                swal({
                    title: "Applying Amount can't be a negative number",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else if (parseFloat(txtApply.value) == 0) {
                txtApply.value = "";
                txtApply.style.border = invalid;
                swal({
                    title: "Applying Amount is not allowed",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else {
                cpaymentinvoice.invoiceId = JSON.parse(cmbInvoice.value);
                cpaymentinvoice.invoiceamount = txtInvoiceamount.value;
                cpaymentinvoice.outstanding = txtOutstanding.value;
                cpaymentinvoice.applingamount = txtApply.value;
                cpaymentinvoice.paidamount = txtRecievedAmount.value;
                invoiceexs = false;
                for (index in cpayment.cpaymentInvoiceList) {
                    // console.log(cpayment.cpaymentInvoiceList[index].applingamount)
                    if (cpayment.cpaymentInvoiceList[index].invoiceId.invoiceno == JSON.parse(cmbInvoice.value).invoiceno) {
                        invoiceexs = true;
                        break;
                    }
                }

                if (invoiceexs) {
                    swal({
                        title: "Invoice Already Exsits",
                        text: "\n",
                        icon: "warning",
                        buttons: false,
                        timer: 1200,
                    })
                } else {
                    cpayment.cpaymentInvoiceList.push(cpaymentinvoice);
                    refreshInvoicesInnerForm();

                    if (cpayment.cpaymentInvoiceList.length != null) {
                        invoiceFlied.style.border = valid;
                        invoiceFliedLegend.style.border = valid;
                    }

                    if (oldcpayment != null && isEqual(cpayment.cpaymentInvoiceList, oldcpayment.cpaymentInvoiceList, 'itemId')) {
                        invoiceFlied.style.border = updated;
                        invoiceFliedLegend.style.border = updated;
                    }
                }
            }
        }
    }else{
        swal({
            title: "You have following errors",
            text: "\n"+innerinvoicegetErrors(),
            icon: "error",
            button: true,
        });
    }
}

function deleteInvoiceInnerForm(cpaymentinvoice, index) {
    swal({
        title: "Do you want to remove Invoice",
        text: "\n",
        icon: "warning",
        buttons : true,
    }).then((willDelete) => {
        if (willDelete) {
            cpayment.cpaymentInvoiceList.splice(index,1);
            refreshInvoicesInnerForm();
            if(cpayment.cpaymentInvoiceList.length == 0){
                invoiceFlied.style.border = invalid;
                invoiceFliedLegend.style.border = invalid;
                txtRecievedAmount.disabled = false;
            }
        }

    });

}

function btnInvoiceInnerClearMC(){
    refreshInvoicesInnerForm();
}




//MethodField
function  refreshMethodsInnerForm() {
    total = 0.00;
    cpaymentmethod = new Object();
    oldcpaymentmethod = null;

    fillCombo(cmbPaymentMethod, "Select Method", cpmethods, "name");
    cmbPaymentMethod.style.border = initial;

    txtCashChequeAmount.value = "";
    txtCashChequeAmount.style.border = initial;

    txtCheque.value = "";
    txtCheque.style.border = initial;
    txtCheque.disabled = false;

    dteCheque.value = "";
    dteCheque.style.border = initial;
    dteCheque.disabled = false;

    fillInnerTable("tblCpMethodsInnerItem", cpayment.cpaymentMethodList, mdifyCpMethodInnerForm , deleteCpMethodInnerForm);

    if (cpayment.cpaymentMethodList.length != 0) {
        for (index in cpayment.cpaymentMethodList) {
            total = parseFloat(total) + parseFloat(cpayment.cpaymentMethodList[index].cashorchequevalue);
        }

        txtTotalCashChequeAmount.value = toDecimal(total,2);;
        txtTotalCashChequeAmount.disabled = true;

        if (txtTotalCashChequeAmount.value == txtRecievedAmount.value) {
            txtTotalCashChequeAmount.style.border = valid;
            txtRecievedAmount.style.border = valid;
            cpayment.totalamount = txtTotalCashChequeAmount.value;
        }else {
            txtTotalCashChequeAmount.style.border = invalid;
            // cpayment.totalamount = txtTotalCashChequeAmount.value;
        }
    }
    else {
        txtTotalCashChequeAmount.value = "";
        txtTotalCashChequeAmount.style.border = initial;
        cpayment.txtTotalCashChequeAmount = null;
    }

    btnInnerCPMethodUpdate.setAttribute("disabled", "disabled");
    $('#btnInnerCPMethodUpdate').css('cursor','not-allowed');

    btnInnerCPMethodAdd.removeAttribute("disabled", "disabled");
    $('#btnInnerCPMethodAdd').css('cursor','pointer');
}

function innermethodgetErrors() {
    var errors = "";
    addvalue = "";

    if (cmbPaymentMethod.value == ""){
        errors = errors + "\n" + "Payment Method Not Selected";
        cmbPaymentMethod.style.border = invalid;
    }
    else  addvalue = 1;

    if (txtCashChequeAmount.value == ""){
        errors = errors + "\n" + "Cash/Cheque Amount Not Enter";
        txtCashChequeAmount.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;
}

function btnCpMethodInnerAddMC() {
    if(innermethodgetErrors()==""){

        if (isNaN(parseFloat(txtCashChequeAmount.value))){
            txtCashChequeAmount.value = "";
            txtCashChequeAmount.style.border = invalid;
            swal({
                title: "Cash/Cheque Amount is not Allowed",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }else {
            if (parseFloat(txtCashChequeAmount.value) < 0) {
                txtCashChequeAmount.value = "";
                txtCashChequeAmount.style.border = invalid;
                swal({
                    title: "Cash/Cheque Amount can't be a negative number",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else if (parseFloat(txtCashChequeAmount.value) == 0) {
                txtCashChequeAmount.value = "";
                txtCashChequeAmount.style.border = invalid;
                swal({
                    title: "Cash/Cheque Amount is not Allowed",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else {
                cpaymentmethod.cpmethodId = JSON.parse(cmbPaymentMethod.value);
                cpaymentmethod.cashorchequevalue = txtCashChequeAmount.value;
                cpaymentmethod.chequeno = txtCheque.value;
                cpaymentmethod.chequedate = dteCheque.value;

                methosexs = false;
                for (index in cpayment.cpaymentMethodList) {
                    if (cpayment.cpaymentMethodList[index].cpmethodId.callingname == JSON.parse(cmbPaymentMethod.value).name) {
                        methosexs = true;
                        break;
                    }
                }

                if (methosexs) {
                    swal({
                        title: "Payment Method Already Exsits",
                        text: "\n",
                        icon: "warning",
                        buttons: false,
                        timer: 1200,
                    })
                } else {
                    cpayment.cpaymentMethodList.push(cpaymentmethod);
                    refreshMethodsInnerForm();

                    if (cpayment.cpaymentMethodList.length != null) {
                        methodFlied.style.border = valid;
                        methodFliedLegend.style.border = valid;
                    }

                    if (oldcpayment != null && isEqual(cpayment.cpaymentMethodList, oldcpayment.cpaymentMethodList, 'itemId')) {
                        methodFlied.style.border = updated;
                        methodFliedLegend.style.border = updated;
                    }

                    if (oldcpayment != null) {
                        if (cpayment.totalamount != oldcpayment.totalamount) {
                            txtTotalCashChequeAmount.style.border = updated;
                        }
                    }

                }
            }
        }
    }else {
        swal({
            title: "You have following errors",
            text: "\n"+innermethodgetErrors(),
            icon: "error",
            button: true,
        });
    }

}

function getInnerMethodUpdate(cpaymentmethod) {
    var updates = "";

    if (cpaymentmethod.cpmethodId.name != JSON.parse(cmbPaymentMethod.value).name)
        updates = updates + "\nPayment Method is Changed";

    if (cpaymentmethod.cashorchequevalue  != txtCashChequeAmount.value)
        updates = updates + "\nCash/Cheque Amount is Changed";

    if (cpaymentmethod.chequeno != txtCheque.value)
        updates = updates + "\nCheque Number is Changed";

    if (cpaymentmethod.chequedate != dteCheque.value)
        updates = updates + "\nClear Of Date is Changed";

    return updates;
}

function btnInnerMethodUpdateMC() {
    var errors = innermethodgetErrors();
    if (errors == "") {
        if (isNaN(parseFloat(txtCashChequeAmount.value))){
            txtCashChequeAmount.value = "";
            txtCashChequeAmount.style.border = invalid;
            swal({
                title: "Cash/Cheque Amount is not Allowed",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }else {
            if (parseFloat(txtCashChequeAmount.value) < 0) {
                txtCashChequeAmount.value = "";
                txtCashChequeAmount.style.border = invalid;
                swal({
                    title: "Cash/Cheque Amount can't be a negative number",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else if (parseFloat(txtCashChequeAmount.value) == 0) {
                txtCashChequeAmount.value = "";
                txtCashChequeAmount.style.border = invalid;
                swal({
                    title: "Cash/Cheque Amount is not Allowed",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else {
                innerUpdates = getInnerMethodUpdate(cpayment.cpaymentMethodList[selectedInnerRow]);
                if (innerUpdates == "") {
                    swal({
                        title: "Nothing Updated",
                        text: "\n",
                        icon: "warning",
                        timer: 1200,
                    })
                } else {
                    swal({
                        title: "Are you sure to update following...?",
                        text: "\n" + innerUpdates,
                        icon: "warning",
                        buttons: true,
                        dangerMode: true,
                        closeOnClickOutside: false,
                    })
                        .then((willUpdate) => {
                                if (willUpdate) {

                                    methodexs = false;
                                    for (index in cpayment.cpaymentMethodList) {
                                        if (cpayment.cpaymentMethodList[index].cpmethodId.name == JSON.parse(cmbPaymentMethod.value).name) {
                                            if (selectedInnerRow != index) {
                                                methodexs = true;
                                                break;
                                            }
                                        }
                                    }

                                    if (methodexs) {
                                        swal({
                                            title: "Paymentmethod Already Exsits",
                                            text: "\n",
                                            icon: "warning",
                                            buttons: false,
                                            timer: 1200,
                                        })
                                    } else {
                                        cpayment.cpaymentMethodList[selectedInnerRow].cpmethodId = JSON.parse(cmbPaymentMethod.value);
                                        cpayment.cpaymentMethodList[selectedInnerRow].cashorchequevalue = txtCashChequeAmount.value;
                                        cpayment.cpaymentMethodList[selectedInnerRow].chequeno = txtCheque.value;
                                        cpayment.cpaymentMethodList[selectedInnerRow].chequedate = dteCheque.value;
                                        refreshMethodsInnerForm();

                                        // if (isEqual(cpayment.cpaymentMethodList, oldcpayment.cpaymentMethodList, "cpmethodId")){
                                        //     methodFlied.style.border = updated;
                                        //     methodFliedLegend.style.border = updated;
                                        // }else {
                                        //     methodFlied.style.border = valid;
                                        //     methodFliedLegend.style.border = valid;
                                        // }
                                        //
                                        // if (cpayment.totalamount != oldcpayment.totalamount){
                                        //     txtTotalCashChequeAmount.style.border = updated;
                                        // }

                                    }

                                }
                            }
                        );
                }
            }
        }
    }
    else{
        swal({
            title: 'You have following errors in your form',icon: "error",
            text: '\n '+innermethodgetErrors(),
            button: true,
            closeOnClickOutside: false,
        });
    }


}

function  mdifyCpMethodInnerForm(cpaymentmethod, indx) {
    selectedInnerRow = indx;
    fillCombo(cmbPaymentMethod, "", cpmethods, "name", cpaymentmethod.cpmethodId.name);
    cmbPaymentMethod.style.border = valid;

    txtCashChequeAmount.value = toDecimal(cpaymentmethod.cashorchequevalue,2);
    txtCashChequeAmount.style.border = valid;

    txtCheque.value = cpaymentmethod.chequeno;
    txtCheque.style.border = valid;

    dteCheque.value = cpaymentmethod.chequedate;
    dteCheque.style.border = valid;


    if (cpaymentmethod.cpmethodId.name == "Cash") {
        txtCheque.disabled = true;
        dteCheque.disabled = true;
        txtCheque.style.border = initial;
        dteCheque.style.border = initial;
    }else{
        txtCheque.disabled = false;
        dteCheque.disabled = false;
    }


    btnInnerCPMethodUpdate.removeAttribute("disabled", "disabled");
    $('#btnInnerCPMethodUpdate').css('cursor','pointer');

    btnInnerCPMethodAdd.setAttribute("disabled", "disabled");
    $('#btnInnerCPMethodAdd').css('cursor','not-allowed');
}

function deleteCpMethodInnerForm(cpaymentmethod, index) {
    swal({
        title: "Do you want to remove Invoice",
        text: "\n",
        icon: "warning",
        buttons : true,
    }).then((willDelete) => {
        if (willDelete) {
            cpayment.cpaymentMethodList.splice(index,1);
            refreshMethodsInnerForm();
            if(cpayment.cpaymentMethodList.length == 0){
                methodFlied.style.border = invalid;
                methodFliedLegend.style.border = invalid;
            }
        }

    });
}


function btnCPMethodInnerClearMC() {
    refreshMethodsInnerForm();
}


function setStyle(style) {
    txtNumber.style.border = style;
    cmbCustomer.style.border = style;
    txtArrears.style.border = style;
    txtNewArrears.style.border = style;
    txtMobile.style.border = style;
    txtRoute.style.border = style;
    txtCreditLimit.style.border = style;
    txtTotalCashChequeAmount.style.border = style;
    txtRecievedDate.style.border = style;
    fldDescription.style.border = style;
    cmbCpaymentstatus.style.border = style;
    cmbEmployeecreated.style.border = style;
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

function cmbCustomerMC() {
    txtArrears.value= toDecimal(cpayment.customerId.tobepaid,2);
    txtArrears.style.border = valid;
    cpayment.oldbalance = txtArrears.value;
    txtArrears.disabled = "disabled";

    txtMobile.value= cpayment.customerId.cmobile;
    txtMobile.style.border = valid;
    txtMobile.disabled = "disabled";

    txtRoute.value= cpayment.customerId.distributionrouteId.routename;
    txtRoute.style.border = valid;
    txtRoute.disabled = "disabled";

    txtCreditLimit.value= toDecimal(cpayment.customerId.maxcreditlimt,2);
    txtCreditLimit.style.border = valid;
    txtCreditLimit.disabled = "disabled";

    //get invoice list by given customer
    invoices = httpRequest("../invoice/listbycustomer?customerid="+JSON.parse(cmbCustomer.value).id,"GET");
    fillCombo(cmbInvoice, "Select Invoice", invoices, "invoiceno");
    cmbInvoice.removeAttribute("disabled", "disabled");

}

function cmbInvoiceMC() {

    if (txtRecievedAmount.value == ""){
        cmbInvoice.value = "";
        cmbInvoice.style.border = initial;

        swal({
            title: "Please Enter Recieved Amount",
            text: "\n",
            icon: "warning",
            buttons: true,
        })

    }else{
        dteInvoicedate.value= cpaymentinvoice.invoiceId.date;
        dteInvoicedate.style.border = valid;
        dteInvoicedate.disabled = "disabled";

        txtInvoiceamount.value= toDecimal((cpaymentinvoice.invoiceId.payableamount),2);
        txtInvoiceamount.style.border = valid;
        txtInvoiceamount.disabled = "disabled";

        txtOutstanding.value = toDecimal((cpaymentinvoice.invoiceId.payableamount)-(cpaymentinvoice.invoiceId.paidamount),2);
        txtOutstanding.style.border = valid;
        txtOutstanding.disabled = "disabled";

        if(parseFloat(txtAvailableamount.value) > parseFloat(txtOutstanding.value)){
            txtApply.value = txtOutstanding.value;
            txtApply.style.border = valid;
        }else{
            txtApply.value = txtAvailableamount.value;
            txtApply.style.border = valid;
        }
    }

    // if(txtAvailableamount.value = 0.00){
    //     console.log("hiiiii");
    // }


}

function cmbPaymentMethodMC() {
    txtCashChequeAmount.value = "";
    txtCheque.value = "";
    dteCheque.value = "";
    txtCashChequeAmount.style.border = initial;
    txtCheque.style.border = initial;
    dteCheque.style.border = initial;

    if (cpaymentmethod.cpmethodId.id == 1) {
        txtCheque.disabled = true;
        dteCheque.disabled = true;
    }else {
        txtCheque.disabled = false;
        dteCheque.disabled = false;
    }
}

function txtRecievedAmountKU() {
    if (isNaN(parseFloat(txtRecievedAmount.value))){
        txtRecievedAmount.value = "";
        txtRecievedAmount.style.border = invalid;
        swal({
            title: "Recieved Amount is not Allowed",
            text: "\n",
            icon: "warning",
            buttons: true,
        })
    }else {
        if (parseFloat(txtRecievedAmount.value) < 0) {
            txtRecievedAmount.value = "";
            txtRecievedAmount.style.border = invalid;
            swal({
                title: "Recieved Amount can't be a negative number",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        } else if (parseFloat(txtRecievedAmount.value) == 0) {
            txtRecievedAmount.value = "";
            txtRecievedAmount.style.border = invalid;
            swal({
                title: "Recieved Amount is not Allowed",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        } else {
            cpaymentinvoice.paidamount = txtRecievedAmount.value;

            txtNewArrears.value = toDecimal(cpayment.oldbalance - cpaymentinvoice.paidamount, 2);
            cpayment.newbalance = txtNewArrears.value;
            txtNewArrears.style.border = valid;

            // if (txtNewArrears.value > txtCreditLimit.value){
            //     swal({
            //         title: "Credit Limit has been Exceeded",
            //         text: "\n",
            //         icon: "warning",
            //         buttons: true,
            //     })
            // }

            txtAvailableamount.value = toDecimal(cpaymentinvoice.paidamount, 2);
            txtAvailableamount.style.border = valid;
            txtAvailableamount.disabled = "disabled";
            txtAvailableamount.style.background = "lightcyan"
        }
    }
}

function txtApplyKU() {
    if (parseFloat(txtAvailableamount.value) < parseFloat(txtApply.value)) {
        swal({
            title: "You don't have enough money to apply",
            text: "\n",
            icon: "warning",
            buttons: true,
        })

        txtApply.value = "";
        txtApply.style.border = initial;

    }

    if (parseFloat(txtOutstanding.value) < parseFloat(txtApply.value)) {
        swal({
            title: "You have exceed Invoice Outsatanding",
            text: "\n",
            icon: "warning",
            buttons: true,
        })

        txtApply.value = "";
        txtApply.style.border = initial;
    }
}



function getErrors() {
    var errors = "";
    addvalue = "";

    if (cpayment.customerId == null){
        errors = errors + "\n" + "Customer Not Selected";
        cmbCustomer.style.border = invalid;
    }
    else  addvalue = 1;

    if (cpayment.oldbalance == null){
        errors = errors + "\n" + "Previous Arrears Not Enter";
        txtArrears.style.border = invalid;
    }
    else  addvalue = 1;

    if (cpayment.cpaymentInvoiceList.length == 0){
        errors = errors + "\n" + "Invoices Not Selected";
        invoiceFlied.style.border = invalid;
        invoiceFliedLegend.style.border = invalid;
    }
    else  addvalue = 1;

    if (cpayment.cpaymentMethodList.length == 0){
        errors = errors + "\n" + "Payment Methods Not Selected";
        methodFlied.style.border = invalid;
        methodFliedLegend.style.border = invalid;
    }
    else  addvalue = 1;

    if (cpayment.totalamount == null){
        errors = errors + "\n" + "Total Amount (Cash And Cheque) Not Enter";
        txtTotalCashChequeAmount.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;

}

function btnAddMC(){
    if(getErrors()==""){
        if(parseFloat(txtRecievedAmount.value) != parseFloat(txtTotalCashChequeAmount.value)){
            txtRecievedAmount.style.border = invalid;
            txtTotalCashChequeAmount.style.border = invalid;
            // alert("You have following errors");
            swal({
                title: 'Total Amounts are Not Equal..!',
                icon: "error",
                text: '\n',
                button: false,
                timer: 1200});
        }
        else if(txtAvailableamount.value != "0.00"){
            swal({
                title: "Money Available to Apply",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }
        else if(txtDescription.value==""){
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
    console.log(cpayment);
    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/cpayment/nextnumber", "GET");
    txtNumber.value = nextNumber.cbillno;
    cpayment.cbillno = txtNumber.value;
    txtNumber.style.border = valid;

    swal({
        title: "Are you sure to add following Customer Payment...?" ,
        text :  "\nBill Number : " + cpayment.cbillno +
            "\nCustomer : " + cpayment.customerId.cname +
            "\nPrevious Arrears : " + cpayment.newbalance +
            "\nTotal Amount (Cash And Cheque) : " + cpayment.totalamount +
            "\nNew Arrears : " + cpayment.newbalance +
            "\nRecieved Date : " + cpayment.recieveddate +
            "\nPayment Status : " + cpayment.cpaymentstatusId.name+
            "\nCreated By : " + cpayment.employeeId.callingname,
        icon: "resourse/image/cpayment.png",
        buttons: [
            'No, Cancel',
            'Yes, Save!'
        ],
        closeOnClickOutside: false,

    }).then((willDelete) => {
        if (willDelete) {
            var response = httpRequest("/cpayment", "POST", cpayment);
            var response ="0";
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
                        viewitem(cpayment,0);
                        printMC();
                    }else if($('#chkClose').prop("checked") == false){
                        $('#formmodal').modal('hide');
                        loadForm();
                        activerowno = 1;
                        loadSearchedTable();
                        // viewitem(cpayment,0);
                        // printMC();
                    }
                });

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

    if(oldcpayment == null && addvalue == ""){
        loadForm();
        selectDeleteRow();
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
                selectDeleteRow();
            }

        });
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldcpayment==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, "Yes, Discard!"],
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
                buttons: [true, "Yes, Discard!"],
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

    clearSelection(tblCpayment);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblCpayment,activerowno,active);

    cpayment = JSON.parse(JSON.stringify(dis));
    oldcpayment = JSON.parse(JSON.stringify(dis));

    spnNumber.style.visibility="visible";

    txtNumber.value = cpayment.cbillno;
    txtArrears.value = toDecimal(cpayment.oldbalance,2);
    txtNewArrears.value = toDecimal(cpayment.newbalance,2);
    txtMobile.value = cpayment.customerId.cmobile;
    txtRoute.value = cpayment.customerId.distributionrouteId.routename;
    txtCreditLimit.value = cpayment.customerId.maxcreditlimt;
    txtTotalCashChequeAmount.value = cpayment.totalamount;
    txtRecievedDate.value = cpayment.recieveddate;
    txtDescription.value = cpayment.description;

    fillCombo3(cmbCustomer,"",activecustomers,"regno","cname",cpayment.customerId.cname);
    $('.select2-container').css('border', '3px solid green');
    fillCombo(cmbCpaymentstatus, "", cpaymentstatuses, "name",cpayment.cpaymentstatusId.name);
    fillCombo(cmbEmployeecreated, "", employeecreated, "callingname", cpayment.employeeId.callingname);

    refreshInvoicesInnerForm();
    refreshMethodsInnerForm();

    if(cpayment.cpaymentInvoiceList.length != 0)
        for(var i=0; i<tblInnerInvoices.children[1].children.length; i++){
            tblInnerInvoices.children[1].children[i].lastChild.firstChild.style.display = "none";
            tblInnerInvoices.children[1].children[i].lastChild.lastChild.style.display = "none";
        }

    if(cpayment.cpaymentMethodList.length != 0)
        for(var i=0; i<tblCpMethodsInnerItem.children[1].children.length; i++){
            tblCpMethodsInnerItem.children[1].children[i].lastChild.firstChild.style.display = "none";
            tblCpMethodsInnerItem.children[1].children[i].lastChild.lastChild.style.display = "none";
        }

    txtRecievedAmount.value = txtTotalCashChequeAmount.value;
    txtRecievedAmount.style.border = valid;
    txtAvailableamount.value = "";
    txtAvailableamount.disabled = true;
    txtAvailableamount.style.background = "lightcyan";

    if(cpayment.cpaymentInvoiceList.length != null){
        invoiceFlied.style.border = valid;
        invoiceFliedLegend.style.border = valid;
    }else {
        invoiceFlied.style.border = invalid;
        invoiceFliedLegend.style.border = invalid;
    }

    if(cpayment.cpaymentMethodList.length != null){
        methodFlied.style.border = valid;
        methodFliedLegend.style.border = valid;
    }else {
        methodFlied.style.border = invalid;
        methodFliedLegend.style.border = invalid;
    }

    $("#invoiceBox").hide();
    $("#btnInnerInvoice").hide();
    $("#methodBox").hide();
    $("#btnInnerMethod").hide();

    setStyle(valid);

    if (cpayment.description == null) {
        fldDescription.style.border = initial;
    }

    txtNumber.disabled = true;
    txtArrears.disabled = true;
    txtMobile.disabled = true;
    txtRoute.disabled = true;
    txtCreditLimit.disabled = true;
    txtRecievedAmount.disabled = true;
    txtDescription.disabled = true;
    cmbCustomer.disabled = true;


}

function btnDeleteMC(dis) {
    cpayment = JSON.parse(JSON.stringify(dis));

    swal({
        title: "Are you sure to delete following Customer Payment...?",
        text :  "\nBill Number : " + cpayment.cbillno +
            "\nCustomer : " + cpayment.customerId.cname +
            "\nPrevious Arrears : " + cpayment.newbalance +
            "\nTotal Amount (Cash And Cheque) : " + cpayment.totalamount +
            "\nNew Arrears : " + cpayment.newbalance +
            "\nRecieved Date : " + cpayment.recieveddate +
            "\nPayment Status : " + cpayment.cpaymentstatusId.name+
            "\nCreated By : " + cpayment.employeeId.callingname,
        icon: "resourse/image/cpaymentdel.png",
        buttons: ['No, Cancel', 'Yes, Delete it!'],
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/cpayment","DELETE",cpayment);
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

function btnPrintTableMC(cpayment) {

    var newwindow=window.open();
    formattab = tblCpayment.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Customer Payment Details</h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(cpind) {
    cpindex = cpind;

    var cpprop = tblCpayment.firstChild.firstChild.children[cpindex].getAttribute('property');

    if(cpprop.indexOf('.') == -1) {
        cpayments.sort(
            function (a, b) {
                if (a[cpprop] < b[cpprop]) {
                    return -1;
                } else if (a[cpprop] > b[cpprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        cpayments.sort(
            function (a, b) {
                if (a[cpprop.substring(0,cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.')+1)] < b[cpprop.substring(0,cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[cpprop.substring(0,cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.')+1)] > b[cpprop.substring(0,cpprop.indexOf('.'))][cpprop.substr(cpprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblCpayment',cpayments,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblCpayment);
    disableButtons(false, true, true);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblCpayment,activerowno,active);
}

