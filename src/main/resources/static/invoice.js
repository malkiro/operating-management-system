window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup", btnSearchMC);
    cmbItem.addEventListener("change", cmbItemCH);
    cmbBatch.addEventListener("change", cmbBatchCH);
    txtRqty.addEventListener("keyup", txtRqtyMC);
    txtDqty.addEventListener("keyup", txtDqtyMC);
    cmbCorder.addEventListener("change", cmbCorderMC);
    cmbCustomer.addEventListener("change", cmbCustomerMC);
    txtDqty.addEventListener("keyup", txtDqtyMC);
    cmbReturn.addEventListener("change", cmbReturnCH);

    privilages = httpRequest("../privilage?module=INVOICE", "GET");

    //Data services for Combo Boxes
    corders = httpRequest("../corder/list", "GET");
    activecorders = httpRequest("../corder/activelist", "GET");
    customers = httpRequest("../customer/invoicelist", "GET");
    activecustomers = httpRequest("../customer/activeinvoicelist", "GET");
    invoicestatuses = httpRequest("../invoicestatus/list", "GET");
    employeecreated = httpRequest("../employee/list", "GET");

    items = httpRequest("../item/list", "GET");
    batches = httpRequest("../batch/list", "GET");
    customerpoints = httpRequest("../customerpoint/list", "GET");
    returns = httpRequest("../customerreturn/list", "GET");


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
    txtSearchname.value = "";
    txtSearchname.style.background = "";

    //Table Area
    activerowno = "";
    activepage = 1;
    var query = "&searchtext=";
    loadTable(1, cmbPagesize.value, query);
}

function loadTable(page, size, query) {
    page = page - 1;
    invoices = new Array();
    var data = httpRequest("/invoice/findAll?page=" + page + "&size=" + size + query, "GET");
    if (data.content != undefined) invoices = data.content;
    createPagination('pagination', data.totalPages, data.number + 1, paginate);
    fillTable('tblInvoice', invoices, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblInvoice);
    selectDeleteRow();

    if (activerowno != "") selectRow(tblInvoice, activerowno, active);

}

function selectDeleteRow() {
    for (index in invoices) {
        if (invoices[index].invoicestatusId.name == "Deleted") {
            tblInvoice.children[1].children[index].style.color = "#f00";
            tblInvoice.children[1].children[index].style.fontWeight = "bold";
            tblInvoice.children[1].children[index].lastChild.children[1].disabled = true;
            tblInvoice.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }

        if (invoices[index].invoicestatusId.name == "Delivered" || invoices[index].invoicestatusId.name =="Completed") {
            tblInvoice.children[1].children[index].lastChild.children[0].disabled = true;
            tblInvoice.children[1].children[index].lastChild.children[0].style.cursor = "not-allowed";
            tblInvoice.children[1].children[index].lastChild.children[1].disabled = true;
            tblInvoice.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if (oldinvoice == null) {
        paginate = true;
    } else {
        if (getErrors() == '' && getUpdates() == '') {
            paginate = true;
        } else {
            paginate = window.confirm("Form has Some Errors or Update Values. " +
                "Are you sure to discard that changes ?");
        }
    }
    if (paginate) {
        activepage = page;
        activerowno = "";
        loadSearchedTable();
        loadForm();
    }

}

function viewitem(inv, rowno) {
    if (rowno!=0)
        invoice = JSON.parse(JSON.stringify(inv));
    else  invoice=inv;
    var today = new Date();
    var month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = today.getDate();
    if (date < 10) date = "0" + date;

    tbInvoiceno.innerHTML = invoice.invoiceno;
    fillInnerTable("tblPrintInnerItem", invoice.invoiceItemList, null, deleteInnerForm);
    tbGrandtotal.innerHTML = toDecimal(invoice.grandtotal,2);
    tbDiscount.innerHTML = invoice.discountedratio+"%";
    tbNettotal.innerHTML = toDecimal(invoice.nettotal,2);
    tbPayable.innerHTML = toDecimal(invoice.payableamount,2);
    if(invoice.description != null){
        tbDescription.innerHTML = "<b>"+"Remarks :-"+"</b>"+ "<br>" +invoice.description;
    }else {
        tbDescription.innerHTML = "";
    }
    tbDate.innerHTML = invoice.date;
    tbDiscountAmount.innerHTML = toDecimal((invoice.grandtotal) * (invoice.discountedratio)/100,2);
    tbPrintDate.innerHTML = today.getFullYear() + "-" + month + "-" + date;
    tbRep.innerHTML = session.getObject("loginuser").loginusername;


    if(invoice.corderId != null) {
        tbCorder.innerHTML = invoice.corderId.cono;
    }else{
        tbCorder.innerHTML = "";
    }
    tbCustomer.innerHTML = invoice.customerId.cname;
    tbCMobile.innerHTML = invoice.customerId.cmobile;
    tbCAddress.innerHTML = invoice.customerId.address;
    tbEmail.innerHTML = invoice.customerId.cemail;
    tbCusId.innerHTML = invoice.customerId.regno;
    // tbInvoicestatus.innerHTML = invoice.invoicestatusId.name;
    // tbEmployeecreated.innerHTML = invoice.employeeId.callingname;

    if(invoice.paidamount != null){
        tbPaidamount.innerHTML = toDecimal(invoice.paidamount,2);
        tbCredit.innerHTML = toDecimal(invoice.payableamount - invoice.paidamount,2);
    }else{
        tbPaidamount.innerHTML = "";
        tbCredit.innerHTML = "";
    }

    if(invoice.customerId.distributionrouteId != null){
        tbRoute.innerHTML = invoice.customerId.distributionrouteId.routename;
    }else{
        tbRoute.innerHTML = "";
    }

    if(invoice.customerreturnId != null){
        tbReturn.innerHTML = invoice.customerreturnId.totalamount;
    }else {
        tbReturn.innerHTML = 0.00;
    }

}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        // "<div style='margin-top: 100px'><h1>Invoice Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () {
        printwindow.print();
    }, 100);
}

function loadForm() {
    invoice = new Object();
    oldinvoice = null;

    invoice.invoiceItemList = new Array();

    activecorders = httpRequest("../corder/activelist", "GET");
    fillCombo(cmbCorder, "Select Order", activecorders, "cono");

    fillCombo(cmbCustomer, "Select Customer", customers, "cname");

    fillCombo(cmbInvoicestatus, "", invoicestatuses, "name", "Active");
    invoice.invoicestatusId = JSON.parse(cmbInvoicestatus.value);

    fillCombo(cmbEmployeecreated, "", employeecreated, "callingname",session.getObject('activeuser').employeeId.callingname);
    invoice.employeeId = JSON.parse(cmbEmployeecreated.value);
    cmbEmployeecreated.disabled = "disabled";

    fillCombo(cmbReturn, "Select Return No", returns, "returnno");

    cmbReturn.style.background = "ash";

    var today = new Date();
    var month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = today.getDate();
    if (date < 10) date = "0" + date;

    dteDate.value = today.getFullYear() + "-" + month + "-" + date;
    invoice.date = dteDate.value;
    dteDate.disabled = "disabled";

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/invoice/nextnumber", "GET");
    txtInvoiceno.value = nextNumber.invoiceno;
    invoice.invoiceno = txtInvoiceno.value;
    txtInvoiceno.disabled = "disabled";


    cmbItem.setAttribute("disabled", "disabled");
    cmbBatch.setAttribute("disabled", "disabled");
    cmbInvoicestatus.setAttribute("disabled", "disabled");
    cmbReturn.setAttribute("disabled", "disabled");
    txtReturn.setAttribute("disabled", "disabled");

    $("#chkClose").prop("checked", false);

    txtMobile.value = "";
    txtAddress.value = "";
    txtGrandtotal.value = "";
    txtGrandtotal.disabled = false;
    txtDiscount.value = "";
    txtDiscount.disabled = false;
    txtNettotal.value = "";
    txtNettotal.disabled = false;
    txtReturn.value = "";
    txtPayable.value = "";
    txtPayable.disabled = false;
    txtDescription.value = "";

    cmbCorder.removeAttribute("disabled", "disabled");
    cmbCustomer.removeAttribute("disabled", "disabled");
    txtMobile.removeAttribute("disabled", "disabled");
    txtAddress.removeAttribute("disabled", "disabled");


    chkStatus.checked = "checked";
    $('#chkStatus').bootstrapToggle('on');
    invoice.status = true;


    setStyle(initial);
    // chkStatus.style.border = valid;
    txtInvoiceno.style.border = valid;
    cmbInvoicestatus.style.border = valid;
    dteDate.style.border = valid;
    cmbEmployeecreated.style.border = valid;
    itemFlied.style.border = initial;
    itemFliedLegend.style.border = initial;

    $("#itemBox").show();
    $("#btnInner").show();

    disableButtons(false, true, true);
    refreshInnerForm();

}


function refreshInnerForm() {

    total = 0.00;

    invoiceitem = new Object();

    fillCombo(cmbItem, "Select Item", items, "itemname", "");
    cmbItem.style.border = initial;

    fillCombo(cmbBatch, "Select Batch", batches, "batchcode", "");
    cmbBatch.style.border = initial;
    cmbBatch.disabled = true;

    txtBatchqty.value = "";
    txtBatchqty.style.border = initial;
    txtBatchqty.disabled = false;

    txtRqty.value = "";
    txtRqty.style.border = initial;
    txtRqty.disabled = false;

    txtDqty.value = "";
    txtDqty.style.border = initial;

    txtMprice.value = "";
    txtMprice.style.border = initial;
    txtMprice.disabled = false;

    txtLinetotal.value = "";
    txtLinetotal.style.border = initial;
    txtLinetotal.disabled = false;

    fillInnerTable("tblInnerItem", invoice.invoiceItemList, null, deleteInnerForm);


    if (invoice.invoiceItemList.length != 0) {
        for(var i=0; i<tblInnerItem.children[1].children.length; i++){
            tblInnerItem.children[1].children[i].lastChild.firstChild.style.display = "none";
        }

        for (index in invoice.invoiceItemList) {
            total = parseFloat(total) + parseFloat(invoice.invoiceItemList[index].linetotal);
        }

        var noreturns = document.getElementById("cmbReturn").length;

        if(noreturns==1){
            cmbReturn.setAttribute("disabled", "disabled");
            txtReturn.setAttribute("disabled", "disabled");
            txtReturn.value = "";
            txtReturn.style.border = initial;
            cmbReturn.style.border = initial;

        }else if(noreturns==2){
            // var e = document.getElementById("cmbReturn");
            // var str = e.options[e.getIn].text;
            var x = document.getElementById("cmbReturn").selectedIndex = "1";
            var y = document.getElementById("cmbReturn").options;

            // console.log(noreturns);
            // console.log(returns[index].totalamount);

            txtReturn.value =  toDecimal(returns[index].totalamount,2);
            txtReturn.style.border = valid;
            invoice.returnvalue = txtReturn.value;
            txtReturn.disabled = "disabled";

            document.getElementById("cmbReturn").style.border = "3px solid green";
            document.getElementById("cmbReturn").style.background = "lightcyan";
        }else {
            cmbReturn.removeAttribute("disabled", "disabled");
            txtReturn.removeAttribute("disabled", "disabled");

            txtReturn.value = "";
            txtReturn.style.border = initial;
            cmbReturn.style.border = initial;
            cmbReturn.style.background = "white";
        }

        txtGrandtotal.value = toDecimal(total,2);
        txtGrandtotal.style.border = valid;
        invoice.grandtotal = txtGrandtotal.value;
        txtGrandtotal.disabled = true;
        generateDiscontRatio();

    } else {
        txtGrandtotal.value = "";
        invoice.grandtotal = null;
    }


    if(txtGrandtotal.value != "") {
        invoice.discountedratio = txtDiscount.value;

        txtNettotal.value = (parseFloat(txtGrandtotal.value) - (parseFloat(txtGrandtotal.value) * parseFloat(invoice.discountedratio)/ 100)).toFixed(2);
        invoice.nettotal = txtNettotal.value;
        txtNettotal.style.border = valid;
        txtNettotal.disabled = true;





        if(txtReturn.disabled == true){
            if (txtReturn.value != ""){
                txtPayable.value = (parseFloat(txtNettotal.value)-parseFloat(txtReturn.value)).toFixed(2);
                invoice.payableamount = txtPayable.value;
                txtPayable.style.border = valid;
                txtPayable.disabled = true;
            }else {
                txtPayable.value = (parseFloat(txtNettotal.value).toFixed(2));
                invoice.payableamount = txtPayable.value;
                txtPayable.style.border = valid;
                txtPayable.disabled = true;

            }

        }else {

            txtPayable.value = "";

        }
    }


    // btnInnerUpdate.setAttribute("disabled", "disabled");
    // $('#btnInnerUpdate').css('cursor','not-allowed');

    btnInnerAdd.removeAttribute("disabled", "disabled");
    $('#btnInnerAdd').css('cursor','pointer');
}

function innergetErrors() {
    var errors = "";
    addvalue = "";

    if (cmbItem.value == ""){
        errors = errors + "\n" + "Item Not Selected";
        cmbItem.style.border = invalid;
    }
    else  addvalue = 1;

    if (cmbBatch.value == ""){
        cmbBatch.style.border = invalid;
        errors = errors + "\n" + "Batch Not Selected";
    }
    else  addvalue = 1;

    if (txtBatchqty.value == ""){
        txtBatchqty.style.border = invalid;
        errors = errors + "\n" + "Batch Quantity Not Enter";
    }
    else  addvalue = 1;

    if (txtRqty.value == ""){
        txtRqty.style.border = invalid;
        errors = errors + "\n" + "Requested  Quantity Not Enter";
    }
    else  addvalue = 1;

    if (txtDqty.value == ""){
        txtDqty.style.border = invalid;
        errors = errors + "\n" + "Delivered Not Enter";
    }
    else  addvalue = 1;

    if (txtMprice.value == ""){
        txtMprice.style.border = invalid;
        errors = errors + "\n" + "Market Price";
    }
    else  addvalue = 1;

    return errors;
}

function btnInnerAddMC() {
    cmbCorder.disabled = true;

    if(innergetErrors()==""){
        if (isNaN(parseFloat(txtDqty.value))){
            txtDqty.value = "";
            txtDqty.style.border = invalid;
            swal({
                title: "Quantity should be a number",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }else {
            if (parseFloat(txtDqty.value) < 0) {
                txtDqty.value = "";
                txtDqty.style.border = invalid;
                swal({
                    title: "Quantity can't be a negative number",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else if (parseFloat(txtDqty.value) == 0) {
                txtDqty.value = "";
                txtDqty.style.border = invalid;
                swal({
                    title: "Quantity 0 can't Add",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else {

                invoiceitem.avalableqty = txtBatchqty.value;
                invoiceitem.requestedqty = txtRqty.value;
                invoiceitem.deliveredqty = txtDqty.value;
                invoiceitem.mprice = toDecimal(txtMprice.value, 2);

                invoiceitem.linetotal = toDecimal(txtLinetotal.value, 2);
                invoiceitem.itemId = JSON.parse(cmbItem.value);
                invoiceitem.batchId = JSON.parse(cmbBatch.value);


                var itemexs = false;
                for (index in invoice.invoiceItemList) {

                    if (invoice.invoiceItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname && invoice.invoiceItemList[index].batchId.batchcode == JSON.parse(cmbBatch.value).batchcode) {
                        itemexs = true;
                        break;
                    }
                }

                if (itemexs) {
                    swal({
                        title: "Item Already Exsits",
                        text: "\n",
                        icon: "warning",
                        buttons: false,
                        timer: 1200,
                    })
                } else {
                    invoice.invoiceItemList.push(invoiceitem);
                    refreshInnerForm();

                    if (invoice.invoiceItemList.length != null) {
                        itemFlied.style.border = valid;
                        itemFliedLegend.style.border = valid;
                    }

                    if (oldinvoice != null && isEqual(invoice.invoiceItemList, oldinvoice.invoiceItemList, 'itemId')) {
                        itemFlied.style.border = updated;
                        itemFliedLegend.style.border = updated;
                    }

                    if (oldinvoice != null) {
                        if (invoice.grandtotal != oldinvoice.grandtotal) {
                            txtGrandtotal.style.border = updated;
                        }

                        if (invoice.discountedratio != oldinvoice.discountedratio) {
                            txtDiscount.style.border = updated;
                        }

                        if (invoice.nettotal != oldinvoice.nettotal) {
                            txtNettotal.style.border = updated;
                        }

                        if (invoice.payableamount != oldinvoice.payableamount) {
                            txtPayable.style.border = updated;
                        }
                    }
                }
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

// function getInnerUpdate(invoiceitem) {
//     var updates = "";
//
//     if (invoiceitem.itemId.itemname != JSON.parse(cmbItem.value).itemname)
//         updates = updates + "\nItem is Changed";
//
//     if (invoiceitem.batchId.batchcode != JSON.parse(cmbBatch.value).batchcode)
//         updates = updates + "\nBatch is Changed";
//
//     if (invoiceitem.avalableqty != txtBatchqty.value)
//         updates = updates + "\nBatch Quantity is Changed";
//
//     if (invoiceitem.requestedqty != txtRqty.value)
//         updates = updates + "\nRequested Quantity is Changed";
//
//     if (invoiceitem.deliveredqty != txtDqty.value)
//         updates = updates + "\nDelivered Quantity is Changed";
//
//     if (invoiceitem.mprice != txtMprice.value)
//         updates = updates + "\nMarket Price is Changed";
//
//     if (invoiceitem.linetotal != txtLinetotal.value)
//         updates = updates + "\nLine Total is Changed";
//
//
//     return updates;
// }

// function btnInnerUpdateMC() {
//     var errors = innergetErrors();
//     if (errors == "") {
//         innerUpdates = getInnerUpdate(invoice.invoiceItemList[selectedInnerRow]);
//
//         if (innerUpdates == "") {
//             swal({
//                 title: "No thing Updated",
//                 text: "\n",
//                 icon: "warning",
//                 timer: 1200,
//             })
//         } else {
//             swal({
//                 title: "Are you sure to update following...?",
//                 text: "\n" + innerUpdates,
//                 icon: "warning",
//                 buttons: true,
//                 dangerMode: true,
//             })
//                 .then((willUpdate) => {
//                 if(willUpdate) {
//                     itemexs = false;
//                     for (index in invoice.invoiceItemList) {
//                         if (invoice.invoiceItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname && invoice.invoiceItemList[index].batchId.batchcode == JSON.parse(cmbBatch.value).batchcode) {
//                             if(selectedInnerRow != index){
//                                 itemexs = true;
//                                 break;
//                             }
//                         }
//                     }
//
//                     if (itemexs) {
//                         swal({
//                             title: "Item Already Exsits",
//                             text: "\n",
//                             icon: "warning",
//                             buttons: false,
//                             timer: 1200,
//                         })
//                     } else {
//                         invoice.invoiceItemList[selectedInnerRow].itemId = JSON.parse(cmbItem.value);
//                         invoice.invoiceItemList[selectedInnerRow].batchId = JSON.parse(cmbBatch.value);
//                         invoice.invoiceItemList[selectedInnerRow].avalableqty = txtBatchqty.value;
//                         invoice.invoiceItemList[selectedInnerRow].requestedqty = txtRqty.value;
//                         invoice.invoiceItemList[selectedInnerRow].deliveredqty = txtDqty.value;
//                         invoice.invoiceItemList[selectedInnerRow].mprice = txtMprice.value;
//                         invoice.invoiceItemList[selectedInnerRow].linetotal = txtLinetotal.value;
//                         refreshInnerForm();
//
//                         if (isEqual(invoice.invoiceItemList, oldinvoice.invoiceItemList, 'itemId')) {
//                             itemFlied.style.border = updated;
//                             itemFliedLegend.style.border = updated;
//
//                         }
//                         if (invoice.grandtotal != oldinvoice.grandtotal){
//                             txtGrandtotal.style.border = updated;
//                         }
//
//                         if (invoice.discountedratio != oldinvoice.discountedratio){
//                             txtDiscount.style.border = updated;
//                         }
//
//                         if (invoice.nettotal != oldinvoice.nettotal){
//                             txtNettotal.style.border = updated;
//                         }
//
//                         if (invoice.payableamount != oldinvoice.payableamount){
//                             txtPayable.style.border = updated;
//                         }
//                     }
//                 }
//             }
//         );
//         }
//     }
//     else
//         swal({
//             title: 'You have following errors in your form',icon: "error",
//             text: '\n '+innergetErrors(),
//             button: true,
//             closeOnClickOutside: false,
//         });
//
// }

function btnInnerClearMC() {
    refreshInnerForm();
}

// function mdifyInnerForm(invoiceitem, indx) {
//     cmbBatch.disabled = false;
//     txtBatchqty.disabled = true;
//     txtMprice.disabled = true;
//
//     if(cmbCorder.value!= "") {
//         txtRqty.disabled = true;
//     }else {
//         txtRqty.disabled = false;
//     }
//
//     txtLinetotal.disabled = true;
//
//     selectedInnerRow = indx;
//
//     fillCombo(cmbItem, "Select Item", items, "itemname", invoiceitem.itemId.itemname);
//     cmbItem.style.border = valid;
//
//     fillCombo(cmbBatch, "Select Batch", batches, "batchcode", invoiceitem.batchId.batchcode);
//     cmbBatch.style.border = valid;
//
//     txtBatchqty.value = invoiceitem.avalableqty;
//     txtBatchqty.style.border = valid;
//
//     txtRqty.value = invoiceitem.requestedqty;
//     txtRqty.style.border = valid;
//
//     txtDqty.value = invoiceitem.deliveredqty;
//     txtDqty.style.border = valid;
//
//     txtMprice.value = toDecimal(invoiceitem.mprice,2);
//     txtMprice.style.border = valid;
//
//     txtLinetotal.value = toDecimal(invoiceitem.linetotal,2);
//     txtLinetotal.style.border = valid;
//
//     // btnInnerUpdate.removeAttribute("disabled", "disabled");
//     // $('#btnInnerUpdate').css('cursor','pointer');
//
//     btnInnerAdd.setAttribute("disabled", "disabled");
//     $('#btnInnerAdd').css('cursor','not-allowed');
// }

function deleteInnerForm(invoiceitem, index) {

    swal({
        title: "Do you want to remove Item",
        text: "\n",
        icon: "warning",
        buttons: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if(willDelete) {
            invoice.invoiceItemList.splice(index, 1);
            refreshInnerForm();
            if(invoice.invoiceItemList.length == 0){
                itemFlied.style.border = invalid;
                itemFliedLegend.style.border = invalid;
            }
        }

    }
);

}

function setStyle(style) {

    txtInvoiceno.style.border = style;
    dteDate.style.border = style;
    cmbCorder.style.border = style;
    cmbCustomer.style.border = style;
    txtMobile.style.border = style;
    txtAddress.style.border = style;
    txtGrandtotal.style.border = style;
    txtDiscount.style.border = style;
    cmbReturn.style.border = style;
    txtNettotal.style.border = style;
    txtReturn.style.border = style;
    txtPayable.style.border = style;
    fldDescription.style.border = style;
    cmbInvoicestatus.style.border = style;
    cmbEmployeecreated.style.border = style;
    chkStatus.style.border = style;

}

function disableButtons(add, upd, del) {

    if (add || !privilages.add) {
        btnAdd.setAttribute("disabled", "disabled");
        $('#btnAdd').css('cursor', 'not-allowed');
    } else {
        btnAdd.removeAttribute("disabled");
        $('#btnAdd').css('cursor', 'pointer')
    }

    if (upd || !privilages.update) {
        btnUpdate.setAttribute("disabled", "disabled");
        $('#btnUpdate').css('cursor', 'not-allowed');
    } else {
        btnUpdate.removeAttribute("disabled");
        $('#btnUpdate').css('cursor', 'pointer');
    }

    if (!privilages.update) {
        $(".buttonup").prop('disabled', true);
        $(".buttonup").css('cursor', 'not-allowed');
    } else {
        $(".buttonup").removeAttr("disabled");
        $(".buttonup").css('cursor', 'pointer');
    }

    if (!privilages.delete) {
        $(".buttondel").prop('disabled', true);
        $(".buttondel").css('cursor', 'not-allowed');
    } else {
        $(".buttondel").removeAttr("disabled");
        $(".buttondel").css('cursor', 'pointer');
    }

}

function cmbCorderMC() {


    fillCombo(cmbCustomer, "", customers, "cname", invoice.corderId.customerId.cname);
    cmbCustomer.style.border = valid;
    invoice.customerId = JSON.parse(cmbCustomer.value);
    cmbCustomer.disabled = "disabled";

    txtMobile.value= invoice.corderId.customerId.cmobile;
    txtMobile.style.border = valid;
    invoice.mobile = txtMobile.value;
    txtMobile.disabled = "disabled";

    txtAddress.value= invoice.corderId.customerId.address;
    txtAddress.style.border = valid;
    invoice.address = txtAddress.value;
    txtAddress.disabled = "disabled";

    //get item list by given corder
    items = httpRequest("../item/listbycorder?corderid="+JSON.parse(cmbCorder.value).id,"GET");
    fillCombo(cmbItem, "Select Item", items, "itemname");
    cmbItem.removeAttribute("disabled", "disabled");

    returns = httpRequest("../customerreturn/listbycustomer?customerid="+JSON.parse(cmbCorder.value).customerId.id,"GET");
    fillCombo(cmbReturn, "Select Return No", returns, "returnno");
    cmbReturn.removeAttribute("disabled", "disabled");


    txtDiscount.value = invoice.corderId.discountedratio;
    txtDiscount.setAttribute("disabled", "disabled");
    txtDiscount.style.border = valid;
    invoice.discountedratio = txtDiscount.value;

}

function cmbCustomerMC() {
    cmbCorder.disabled = true;
    items = httpRequest("../item/list", "GET");
    fillCombo(cmbItem, "Select Item", items, "itemname");
    returns = httpRequest("../customerreturn/listbycustomer?customerid="+JSON.parse(cmbCustomer.value).id,"GET");
    fillCombo(cmbReturn, "Select Return No", returns, "returnno");
    cmbReturn.removeAttribute("disabled", "disabled");
    txtReturn.removeAttribute("disabled", "disabled");

    txtMobile.value= invoice.customerId.cmobile;
    txtMobile.style.border = valid;
    invoice.mobile = txtMobile.value;
    txtMobile.disabled = "disabled";

    txtAddress.value= invoice.customerId.address;
    txtAddress.style.border = valid;
    invoice.address = txtAddress.value;
    txtAddress.disabled = "disabled";

    cmbItem.removeAttribute("disabled", "disabled");
}


function cmbItemCH() {
    //get batch list by given item
    batches = httpRequest("../batch/listbyitem?itemid="+JSON.parse(cmbItem.value).id,"GET");
    fillCombo(cmbBatch, "Select Batch", batches, "batchcode", "");
    cmbBatch.removeAttribute("disabled", "disabled");

    txtRqty.value = "";
    txtRqty.style.border = initial;
    txtRqty.disabled = true;

    txtDqty.value = "";
    txtDqty.style.border = initial;

    if(cmbCorder.value!= ""){
        corderitem = httpRequest("../corderitem/bycorderitem?corderid="+JSON.parse(cmbCorder.value).id+"&itemid="+JSON.parse(cmbItem.value).id,"GET");
        txtRqty.value = corderitem.qty ;
        txtRqty.style.border = valid;

        txtDqty.value =corderitem.qty ;
        txtDqty.style.border = valid;
    }else {
        txtRqty.disabled = false;
    }

    cmbBatch.style.border = initial;
    txtBatchqty.value = "";
    txtBatchqty.style.border = initial;


    txtMprice.value = "";
    txtMprice.style.border = initial;
    txtMprice.disabled = false;

    txtLinetotal.value = "";
    txtLinetotal.style.border = initial;
    txtLinetotal.disabled = false;

}

function cmbBatchCH() {
    txtBatchqty.style.border = valid;
    txtBatchqty.value = invoiceitem.batchId.avalableqty;
    invoiceitem.avalableqty = txtBatchqty.value;
    txtBatchqty.disabled=true;

    txtMprice.value =parseFloat(invoiceitem.batchId.marketprice).toFixed(2);
    txtMprice.style.border = valid;
    txtMprice.disabled=true;

    if (invoice.corderId != null) {
        txtLinetotal.value = (parseFloat(txtMprice.value) * parseFloat(txtRqty.value)).toFixed(2);
        txtLinetotal.style.border = valid;
        txtLinetotal.disabled=true;
    }

    if (parseFloat(txtBatchqty.value)<parseFloat(txtRqty.value)){
        txtDqty.value ="" ;
        txtDqty.style.border = invalid;
    }else{
        txtDqty.value =txtRqty.value ;
        txtDqty.style.border = valid;
    }

}

function cmbReturnCH() {
    if(parseFloat(txtNettotal.value)< toDecimal(invoice.customerreturnId.totalamount)){
        txtPayable.value = (parseFloat(txtNettotal.value).toFixed(2));
        invoice.payableamount = txtPayable.value;
        txtPayable.style.border = valid;
        txtPayable.disabled = true;

        txtReturn.value = "";
        txtReturn.style.border = initial;
        txtReturn.disabled = true;
        cmbReturn.value = "";
        cmbReturn.style.border = initial;

        swal({
            title: "Returns can't accept at this time",
            text: "\n",
            icon: "warning",
            buttons: true,
        })

    }else{
        cmbReturn.style.background = "lightcyan";
        txtReturn.style.border = valid;
        txtReturn.value = toDecimal(invoice.customerreturnId.totalamount,2);
        invoice.returnvalue = txtReturn.value;
        txtReturn.disabled=true;

        txtPayable.value= toDecimal((parseFloat(txtNettotal .value)- parseFloat(txtReturn.value)),2);
        invoice.payableamount = txtPayable.value;
        txtPayable.style.border = valid;
        txtPayable.disabled = true;
    }
}

function txtRqtyMC() {
    if (isNaN(parseFloat(txtRqty.value))){
        txtRqty.value = "";
        txtRqty.style.border = invalid;
        swal({
            title: "Requested Quantity should be a number",
            text: "\n",
            icon: "warning",
            buttons: true,
        })
    }else {
        if (parseFloat(txtRqty.value) < 0) {
            txtRqty.value = "";
            txtRqty.style.border = invalid;
            swal({
                title: "Requested Quantity can't be a negative number",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        } else if (parseFloat(txtRqty.value) == 0) {
            txtRqty.value = "";
            txtRqty.style.border = invalid;
            swal({
                title: "Requested Quantity 0 can't Add",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        } else {
            if (parseFloat(txtBatchqty.value) >= parseFloat(txtRqty.value)) {
                txtDqty.value = parseFloat(txtRqty.value);
                invoice.deliveredqty = txtDqty.value;
                txtDqty.style.border = valid;

                txtLinetotal.value = toDecimal(parseFloat(txtMprice.value) * parseFloat(txtDqty.value), 2);
                txtLinetotal.style.border = valid;
                txtLinetotal.disabled = true;
            } else {
                txtDqty.value = "";
                txtDqty.style.border = invalid;

                txtLinetotal.value = "";
                txtLinetotal.style.border = initial;
                txtLinetotal.disabled = false;
            }
        }
    }
}

function txtDqtyMC() {

    if(parseFloat(txtDqty.value)>parseFloat(txtRqty.value)){
        swal({
            position: 'center',
            icon: 'error',
            title: 'Requested Qty Exceeded!',
            text: '\n',
            button: false,
            timer: 2500
        });

        txtDqty.value="";
        txtDqty.style.border = initial;
    }

    if(parseFloat(txtBatchqty.value)<parseFloat(txtDqty.value)){
        swal({
            position: 'center',
            icon: 'error',
            title: 'Batch Quantity is not sufficient!',
            text: '\n You can add'+ '\t' +txtBatchqty.value+ ' quantity from this batch',
            button: false,
            timer: 2500
        });

        txtDqty.value="";
        txtDqty.style.border = initial;
    }

    if(invoice.invoiceItemList.length != 0){
        var dvqty = 0;
        for(var index in invoice.invoiceItemList){

            if(invoice.invoiceItemList[index].itemId.id==JSON.parse(cmbItem.value).id){
                dvqty = parseInt(dvqty)+parseInt(invoice.invoiceItemList[index].deliveredqty);
            }
        }
    var currentdvqty =parseInt(dvqty)+ parseInt(txtDqty.value);
        // console.log(currentdvqty);
        if (currentdvqty>parseInt(txtRqty.value)){
            swal({
                position: 'center',
                icon: 'error',
                title: 'Requested Qty Exceeded!',
                text: '\n',
                button: false,
                timer: 2500
            });
            txtDqty.value="";
            txtDqty.style.border = initial;
        }

    }


    txtLinetotal.value = toDecimal(parseFloat(txtMprice.value) * parseFloat(txtDqty.value),2);
    txtLinetotal.style.border = valid;
    txtLinetotal.disabled = true;
}



function getErrors() {
    var errors = "";
    addvalue = "";

    if (invoice.corderId != null) {
        if (invoice.corderId == null){
            errors = errors + "\n" + "Customer Order Not Selected";
            cmbCorder.style.border = invalid;
        }
        else addvalue = 1;
    }

    if (invoice.customerId == null){
        errors = errors + "\n" + "Customer Not Selected";
        cmbCustomer.style.border = invalid;
    }
    else addvalue = 1;


    if (invoice.invoiceItemList.length == 0){
        errors = errors + "\n" + "Items Not Selected";
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }
    else addvalue = 1;

    if (invoice.grandtotal == null){
        errors = errors + "\n" + "Grand Total Not Enter";
        txtGrandtotal.style.border = invalid;
    }
    else addvalue = 1;

    if (invoice.discountedratio == null){
        errors = errors + "\n" + "Discount Ratio Not Enter";
        txtDiscount.style.border = invalid;
    }
    else addvalue = 1;

    if (invoice.nettotal == null){
        errors = errors + "\n" + "Net Total Not Enter";
        txtNettotal .style.border = invalid;
    }
    else addvalue = 1;

    if (invoice.payableamount == null){
        errors = errors + "\n" + "Payable Not Enter";
        txtPayable .style.border = invalid;
    }
    else addvalue = 1;

    return errors;

}

function btnAddMC() {
    if (getErrors() == "") {
        if (txtDiscount.value == "" || txtDescription.value == "") {
            swal({
                title: "Are you sure to continue...?",
                text: "Form has some empty fields.....",
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            }).then((willAdd) => {
                if(willAdd) {
                    savedata();
                }
            }
        )
            ;

        } else {
            savedata();
        }
    } else {
        swal({
            title: "You have following errors",
            text: "\n" + getErrors(),
            icon: "error",
            button: true,
            closeOnClickOutside: false,
        });

    }
}

function savedata() {
    var status = "Not-Delivered";
    if(invoice.status)
        status = "Delivered";

    if(invoice.corderId == null){
        swal({
            title: "Are you sure to create following Invoice...?",
            text: "\nInvoice No : " + invoice.invoiceno +
                "\nInvoice Date : " + invoice.date +
                "\nCustomer Name : " + invoice.customerId.cname +
                "\nCustomer Mobile : " + invoice.customerId.cmobile +
                "\nCustomer Address : " + invoice.customerId.address +
                "\nGrand Total : " + invoice.grandtotal +
                "\nDiscount Ratio  : " + invoice.discountedratio +
                "\nNet Total : " + invoice.nettotal +
                "\nPayable Amount : " + invoice.payableamount +
                "\nDeliver Status   : " + status +
                "\nInvoice Status  : " + invoice.invoicestatusId.name +
                "\nEmployee Created  : " + invoice.employeeId.callingname,
            icon: "resourse/image/invoice.png",
            buttons: [
                'No, Cancel',
                'Yes, Save!'
            ],
            closeOnClickOutside: false,

        }).then((willAdd) => {
                if(willAdd) {
                    var response = httpRequest("/invoice", "POST", invoice);
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
                                // viewitem(invoice,0);
                                // printMC();
                            }else if($('#chkClose').prop("checked") == false){
                                $('#formmodal').modal('hide');
                                loadForm();
                                activerowno = 1;
                                loadSearchedTable();
                                // viewitem(invoice,0);
                                // printMC();
                            }
                        });

                    } else swal({
                        title: 'Save not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true,
                        closeOnClickOutside: false,
                    });
                }
            }
        );
    }
    else{
        swal({
            title: "Are you sure to create following Invoice...?",
            text: "\nInvoice No : " + invoice.invoiceno +
                "\nInvoice Date : " + invoice.date +
                "\nCustomer Order No : " + invoice.corderId.cono +
                "\nCustomer Name : " + invoice.customerId.cname +
                "\nCustomer Mobile : " + invoice.customerId.cmobile +
                "\nCustomer Address : " + invoice.customerId.address +
                "\nGrand Total : " + invoice.grandtotal +
                "\nDiscount Ratio  : " + invoice.discountedratio +
                "\nNet Total : " + invoice.nettotal +
                "\nPayable Amount : " + invoice.payableamount +
                "\nDeliver Status   : " + status +
                "\nInvoice Status  : " + invoice.invoicestatusId.name +
                "\nEmployee Created  : " + invoice.employeeId.callingname,
            icon: "resourse/image/invoice.png",
            buttons: [
                'No, Cancel',
                'Yes, Save!'
            ],
            closeOnClickOutside: false,
        }).then((willAdd) => {
                if(willAdd) {
                    var response = httpRequest("/invoice", "POST", invoice);
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
                                // viewitem(invoice,0);
                                // printMC();
                            }else if($('#chkClose').prop("checked") == false){
                                $('#formmodal').modal('hide');
                                loadForm();
                                activerowno = 1;
                                loadSearchedTable();
                                // viewitem(invoice,0);
                                // printMC();
                            }
                        });
                    } else swal({
                        title: 'Save not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true,
                        closeOnClickOutside: false,
                    });
                }
            }
        );
    }
}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if (oldinvoice == null && addvalue == "") {
        loadForm();
        selectDeleteRow();
    } else {
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n",
            icon: "warning",
            buttons: [true, "Yes, Discard!"],
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willClear) => {
            if(willClear) {
                loadForm();
                selectDeleteRow();
            }

        }
    );
    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldinvoice==null){
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
        if(getErrors()==''&&getUpdates()==''){
            $('#formmodal').modal('hide');
            loadForm();
            selectDeleteRow();
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
                    selectDeleteRow();
                }else{

                }
            });
        }
    }
}


function fillForm(inv, rowno) {
    activerowno = rowno;

    clearSelection(tblInvoice);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblInvoice,activerowno,active);

    invoice = JSON.parse(JSON.stringify(inv));
    oldinvoice = JSON.parse(JSON.stringify(inv));

    cmbItem.removeAttribute("disabled", "disabled");
    cmbBatch.removeAttribute("disabled", "disabled");
    cmbInvoicestatus.removeAttribute("disabled", "disabled");
    txtDiscount.setAttribute("disabled", "disabled");
    txtNettotal.setAttribute("disabled", "disabled");
    txtPayable.setAttribute("disabled", "disabled");

    txtInvoiceno.value = invoice.invoiceno;
    txtGrandtotal.value = invoice.grandtotal;
    txtDiscount.value = invoice.discountedratio;
    txtNettotal.value = invoice.nettotal;

    txtDescription.value = invoice.description;
    dteDate.value = invoice.date;

    if (invoice.status == 1) {
        $('#chkStatus').bootstrapToggle('on');
    } else {
        $('#chkStatus').bootstrapToggle('off');
    }


    fillCombo(cmbInvoicestatus, "", invoicestatuses, "name", invoice.invoicestatusId.name);
    fillCombo(cmbEmployeecreated, "", employeecreated, "callingname", invoice.employeeId.callingname);

    if (invoice.invoicestatusId.name == "In-Delivery"){
        chkStatus.disabled= true;
    }else{
        chkStatus.disabled= false;
    }

    refreshInnerForm();

    if(invoice.invoiceItemList.length != 0)
        for(var i=0; i<tblInnerItem.children[1].children.length; i++){
            tblInnerItem.children[1].children[i].lastChild.firstChild.style.display = "none";
            tblInnerItem.children[1].children[i].lastChild.lastChild.style.display = "none";
        }

    if(invoice.invoiceItemList.length != null){
        itemFlied.style.border = valid;
        itemFliedLegend.style.border = valid;
    }else {
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }

    cmbCorder.setAttribute("disabled", "disabled");
    cmbCustomer.setAttribute("disabled", "disabled");
    txtMobile.setAttribute("disabled", "disabled");
    txtAddress.setAttribute("disabled", "disabled");
    cmbInvoicestatus.removeAttribute("disabled", "disabled");

    $("#itemBox").hide();
    $("#btnInner").hide();

    setStyle(valid);


    if (invoice.discountedratio == null) {
        txtDiscount.style.border = initial;
    }

    if (invoice.description == null) {
        fldDescription.style.border = initial;
    }

    // if (invoice.customerreturnId == null) {
    //     cmbReturn.style.border = initial;
    //     txtReturn.style.border = initial;
    // }

    if (invoice.corderId == null) {
        corders = httpRequest("../corder/list", "GET");
        fillCombo(cmbCorder, "Select Order", corders, "cono");
        cmbCorder.style.border = initial;
    }else{
        fillCombo(cmbCorder, "", corders, "cono", invoice.corderId.cono);
        cmbCorder.style.border = valid;
    }

    if (invoice.customerreturnId == null) {
        returns = httpRequest("../customerreturn/list", "GET");
        fillCombo(cmbReturn, "Select Return No", returns, "returnno","");
        cmbReturn.style.border = initial;
        txtReturn.value = "";
        txtReturn.style.border = initial;
        cmbReturn.style.background = "lightcyan"
        cmbReturn.disabled = true;
        txtReturn.disabled = true;
    }else{
        fillCombo(cmbReturn, "", returns, "returnno", invoice.customerreturnId.returnno);
        cmbReturn.style.border = valid;
        txtReturn.value = toDecimal(invoice.returnvalue);
        txtReturn.style.border = valid;
        cmbReturn.disabled = true;
        cmbReturn.style.background = "lightcyan"
        txtReturn.disabled = true;
    }

    fillCombo(cmbCustomer, "", customers, "cname", invoice.customerId.cname);
    cmbCustomer.style.border = valid;
    txtMobile.value = invoice.customerId.cmobile;
    txtAddress.value = invoice.customerId.address;
    txtPayable.value = toDecimal(invoice.payableamount,2);
}


function getUpdates() {

    var updates = "";

    if (invoice != null && oldinvoice != null) {

        if (invoice.description != oldinvoice.description)
            updates = updates + "\nDescription is Changed";

        if (invoice.status != oldinvoice.status)
            updates = updates + "\n Delivery Status is Changed" ;

        if (invoice.invoicestatusId.name != oldinvoice.invoicestatusId.name)
            updates = updates + "\nInvoice Status is Changed";

    }

    return updates;

}

function btnUpdateMC() {
    var errors = getErrors();
    if (errors == "") {
        var updates = getUpdates();
        if (updates == "")
            swal({
                title: 'Nothing Updated..!', icon: "warning",
                text: '\n',
                button: false,
                timer: 1200
            });
        else {
            swal({
                title: "Are you sure to update following invoice details...?",
                text: "\n" + getUpdates(),
                icon: "resourse/image/invoiceup.png",
                buttons: ['No, Cancel', 'Yes, Update!'],
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if(willUpdate) {
                    var response = httpRequest("/invoice", "PUT", invoice);
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

                    } else swal({
                        title: 'Update not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true,
                        closeOnClickOutside: false,
                    });
                }
            }
        )
            ;
        }
    } else
        swal({
            title: 'You have following errors in your form', icon: "error",
            text: '\n ' + getErrors(),
            button: true,
            closeOnClickOutside: false,
        });

}

function btnDeleteMC(inv) {
    invoice = JSON.parse(JSON.stringify(inv));

    var status = "Not-Delivered";
    if(invoice.status)
        status = "Delivered";

    if(invoice.corderId == null){
        swal({
            title: "Are you sure to delete following Invoice...?",
            text: "\nInvoice No : " + invoice.invoiceno +
                "\nInvoice Date : " + invoice.date +
                "\nCustomer Name : " + invoice.customerId.cname +
                "\nCustomer Mobile : " + invoice.customerId.cmobile +
                "\nCustomer Address : " + invoice.customerId.address +
                "\nGrand Total : " + invoice.grandtotal +
                "\nDiscount Ratio  : " + invoice.discountedratio +
                "\nNet Total : " + invoice.nettotal +
                "\nPayable Amount : " + invoice.payableamount +
                "\nDeliver Status   : " + status +
                "\nInvoice Status  : " + invoice.invoicestatusId.name +
                "\nEmployee Created  : " + invoice.employeeId.callingname,
            icon: "resourse/image/invoicedel.png",
            buttons: ['No, Cancel', 'Yes, Delete it!'],
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willDelete) => {
            if(willDelete) {
                var responce = httpRequest("/invoice", "DELETE", invoice);
                if (responce == 0) {
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
        }
    );
    }
    else{
        swal({
            title: "Are you sure to delete following Invoice...?",
            text: "\nInvoice No : " + invoice.invoiceno +
                "\nInvoice Date : " + invoice.date +
                "\nCustomer Order No : " + invoice.corderId.cono +
                "\nCustomer Name : " + invoice.customerId.cname +
                "\nCustomer Mobile : " + invoice.customerId.cmobile +
                "\nCustomer Address : " + invoice.customerId.address +
                "\nGrand Total : " + invoice.grandtotal +
                "\nDiscount Ratio  : " + invoice.discountedratio +
                "\nNet Total : " + invoice.nettotal +
                "\nPayable Amount : " + invoice.payableamount +
                "\nDeliver Status   : " + status +
                "\nInvoice Status  : " + invoice.invoicestatusId.name +
                "\nEmployee Created  : " + invoice.employeeId.callingname,
            icon: "resourse/image/invoicedel.png",
            buttons: ['No, Cancel', 'Yes, Delete it!'],
            dangerMode: true,
            closeOnClickOutside: false,
        }).then((willDelete) => {
            if(willDelete) {
                var responce = httpRequest("/invoice", "DELETE", invoice);
                if (responce == 0) {
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
        }
    );
    }

}

function loadSearchedTable() {

    var searchtext = txtSearchname.value;

    var query = "&searchtext=";

    if (searchtext != "")
        query = "&searchtext=" + searchtext;
    //window.alert(query);
    loadTable(activepage, cmbPagesize.value, query);
    disableButtons(false, true, true);
    selectDeleteRow();

}

function btnSearchMC() {
    activepage = 1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
}

function btnPrintTableMC(invoice) {

    var newwindow = window.open();
    formattab = tblInvoice.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Invoice Details : </h1></div>" +
        "<div>" + formattab + "</div>" +
        "</body>" +
        "</html>");
    setTimeout(function () {
        newwindow.print();
        newwindow.close();
    }, 100);
}

function sortTable(invind) {
    cindex = invind;

    var invprop = tblInvoice.firstChild.firstChild.children[cindex].getAttribute('property');

    if (invprop.indexOf('.') == -1) {
        invoices.sort(
            function (a, b) {
                if (a[invprop] < b[invprop]) {
                    return -1;
                } else if (a[invprop] > b[invprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    } else {
        invoices.sort(
            function (a, b) {
                if (a[invprop.substring(0, invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.') + 1)] < b[invprop.substring(0, invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.') + 1)]) {
                    return -1;
                } else if (a[invprop.substring(0, invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.') + 1)] > b[invprop.substring(0, invprop.indexOf('.'))][invprop.substr(invprop.indexOf('.') + 1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblInvoice', invoices, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblInvoice);
    selectDeleteRow();

    if (activerowno != "") selectRow(tblInvoice, activerowno, active);

}

function generateDiscontRatio() {
    if(cmbCustomer.value != "") {
        var customer = new Object();
        var customer = JSON.parse(cmbCustomer.value);

        for (var index in customerpoints) {
            if (customerpoints[index].startrate < customer.point && customerpoints[index].endrate >= customer.point) {
                customer.point = parseInt(customer.point) + parseInt(customerpoints[index].pointperinvoice);
                invoice.customerId = customer;
                break;
            }
        }
        for (var index in customerpoints) {
            if (parseFloat(txtGrandtotal.value) >= parseFloat(customerpoints[index].invoiceamount)) {
                txtDiscount.value = parseFloat(customerpoints[index].discountratio);
                invoice.discountedratio = parseFloat(customerpoints[index].discountratio);
                txtDiscount.style.border = valid;
                txtDiscount.disabled = true;
                break;
            }else {
                txtDiscount.value = 0.00;
                invoice.discountedratio = 0.00;
                txtDiscount.style.border = valid;
                txtDiscount.disabled = true;
            }
        }
    }
    console.log(customer)
}



