window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    $(document).ready(function() {
        $('.js-example-basic-single').select2();
    });

    txtSearchname.addEventListener("keyup",btnSearchMC);
    cmbSupplier.addEventListener("change",cmbSupplierCH);
    cmbPono.addEventListener("change",cmbPonoCH);
    cmbCategory.addEventListener("change",cmbCategoryCH);
    cmbItem.addEventListener("change",cmbItemCH);
    txtQty.addEventListener("keyup",txtQtyMC);
    txtBatchcode.addEventListener("mouseout",txtBatchcodeKU);
    txtPprice.addEventListener("change",txtPpriceKU);
    txtDiscountratio.addEventListener("keyup", txtDiscountratioMC);
    txtDiscount.addEventListener("keyup", txtDiscountMC);

    privilages = httpRequest("../privilage?module=GRN","GET");

    //Data services for Combo Boxes
    suppliers = httpRequest("../supplier/list","GET");
    activesuppliers = httpRequest("../supplier/activelist","GET");
    porders = httpRequest("../porder/list","GET");
    categories = httpRequest("../category/list","GET");
    grnstatuses = httpRequest("../grnstatus/list","GET");
    employeeordered = httpRequest("../employee/list","GET");
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
    grns = new Array();
    var data = httpRequest("/grn/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) grns = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblGrn',grns,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblGrn);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblGrn,activerowno,active);

}

function selectDeleteRow() {
    for(index in grns){
        if(grns[index].grnstatusId.name =="Deleted"){
            tblGrn.children[1].children[index].style.color = "#f00";
            tblGrn.children[1].children[index].style.fontWeight = "bold";
            tblGrn.children[1].children[index].lastChild.children[1].disabled = true;
            tblGrn.children[1].children[index].lastChild.children[1].style.cursor ="not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(oldgrn==null){
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

function viewitem(gr,rowno) {

    grn = JSON.parse(JSON.stringify(gr));

    tbGrnno.innerHTML = grn.grnno;
    tbSupplierno.innerHTML = grn.supinvoiceno;
    tbSupplier.innerHTML = grn.porderId.supplierId.sname;
    tbPono.innerHTML = grn.porderId.pono;
    if(grn.categoryId != null){
        tbCategory.innerHTML = grn.categoryId.name;
    }else{
        tbCategory.innerHTML = "";
    }
    fillInnerTable("tblPrintInnerItem", grn.grnBatchList,mdifyInnerForm , deleteInnerForm);
    tbGrandtotal.innerHTML = toDecimal(grn.grandtotal,2);
    tbDiscountratio.innerHTML = grn.discountedratio+"%";
    tbDiscount.innerHTML = toDecimal(grn.discount);
    tbNettotal.innerHTML = toDecimal(grn.nettotal);
    tbRecieveddate.innerHTML = grn.receiveddate;
    tbDescription.innerHTML = grn.description;
    tbOrderdate.innerHTML = grn.addeddate;
    tbGrnstatus.innerHTML = grn.grnstatusId.name;
    tbEmployeeOrdered.innerHTML = grn.employeeId.callingname;
}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;}"+

        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "<script src='resourse/jquery/jquery-3.4.1.min.js'></script>" +
        "<script src='resourse/jquery/popper.min.js'></script>" +
        "<script src='resourse/bootstrap/js/bootstrap.bundle.min.js'></script>" +
        "<script src='resourse/script/common.bitproject.js'></script>" +
        "</head>" +
        "</body>" +
        "<div style='margin-top: 100px'><h1>Goods Recieved Note Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Goods Recieved Note Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    grn = new Object();
    oldgrn = null;

    grn.grnBatchList = new Array();

    fillCombo(cmbSupplier, "Select Supplier", activesuppliers, "sname");
    cmbSupplier.disabled = false;

    fillCombo(cmbPono, "Select POrder", porders, "pono");
    cmbPono.setAttribute("disabled", "disabled");

    fillCombo(cmbCategory, "Select Category", categories, "name");
    cmbCategory.setAttribute("disabled", "disabled");

    fillCombo(cmbGrnstatus, "", grnstatuses, "name", "Pending");
    grn.grnstatusId = JSON.parse(cmbGrnstatus.value);

    fillCombo(cmbEmployeeOrdered, "", employeeordered, "callingname", session.getObject('activeuser').employeeId.callingname);
    grn.employeeId = JSON.parse(cmbEmployeeOrdered.value);
    cmbEmployeeOrdered.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteOrderdate.value=today.getFullYear()+"-"+month+"-"+date;
    grn.addeddate=dteOrderdate.value;
    dteOrderdate.disabled="disabled";

    //set min and max date
    //Expire Date
    var thousanddatsafterday = new Date();
    thousanddatsafterday.setDate(today.getDate()+1000);
    txtExpdate.min = today.getFullYear() + "-" + month + "-" + date;
    txtExpdate.max = thousanddatsafterday.getFullYear()+"-"+getmonthdate(thousanddatsafterday);

    //Manufacture Date
    var twoweekbeforeday = new Date();
    twoweekbeforeday.setDate(today.getDate()-100);
    txtMnfdate.max = today.getFullYear() + "-" + month + "-" + date;
    txtMnfdate.min = twoweekbeforeday.getFullYear()+"-"+getmonthdate(twoweekbeforeday);

    //Recieved Date
    var threedaysbeforeday = new Date();
    threedaysbeforeday.setDate(today.getDate()-3);
    txtRecieveddate.max = today.getFullYear() + "-" + month + "-" + date;
    txtRecieveddate.min = threedaysbeforeday.getFullYear()+"-"+getmonthdate(threedaysbeforeday);

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/grn/nextnumber", "GET");
    txtGrnno.value = nextNumber.grnno;
    grn.grnno = txtGrnno.value;
    txtGrnno.disabled="disabled";

    cmbGrnstatus.setAttribute("disabled", "disabled");
    cmbItem.setAttribute("disabled", "disabled");
    $("#chkClose").prop("checked", false);

    txtSupplierno.value = "";
    txtGrandtotal.value = "";
    txtGrandtotal.disabled = false;
    txtDiscountratio.value = "";
    txtDiscount.value = "";
    txtDiscount.disabled = false;
    txtNettotal.value = "";
    txtNettotal.disabled = false;
    txtRecieveddate.value = "";
    txtDescription.value = "";


    setStyle(initial);
    txtGrnno.style.border=valid;
    dteOrderdate.style.border=valid;
    cmbGrnstatus.style.border=valid;
    cmbEmployeeOrdered.style.border=valid;
    itemFlied.style.border = initial;
    itemFliedLegend.style.border = initial;

    $("#itemBox").show();
    $("#btnInner").show();

    disableButtons(false, true, true);

    refreshInnerForm();
}

function setStyle(style) {
    txtGrnno.style.border=style;
    cmbSupplier.style.border=style;
    cmbPono.style.border=style;
    cmbCategory.style.border=style;
    txtSupplierno.style.border=style;
    txtGrandtotal.style.border=style;
    txtDiscountratio.style.border=style;
    txtDiscount.style.border=style;
    txtNettotal.style.border=style;
    txtRecieveddate.style.border=style;
    // fldDescription.style.border = style;
    dteOrderdate.style.border=style;
    cmbGrnstatus.style.border=style;
    cmbEmployeeOrdered.style.border=style;

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

function cmbSupplierCH() {
    //get porder list by given supplier
    porders = httpRequest("../porder/listbysupplier?supplierid="+JSON.parse(cmbSupplier.value).id,"GET");
    fillCombo(cmbPono, "Select POrder", porders, "pono");
    cmbPono.removeAttribute("disabled", "disabled");
    cmbPono.style.border = initial;

    //when change before inneradd
    cmbItem.setAttribute("disabled", "disabled");
    refreshInnerForm();

    // if(oldgrn != null && oldgrn.supplierId.sname != grn.supplierId.sname){
    //     cmbSupplier.style.border = updated;
    // }else {
    //     cmbSupplier.style.border = valid;
    // }
}

function cmbPonoCH() {
    //get item list by given porder
    categories = httpRequest("../category/listbyporder?porderid="+JSON.parse(cmbPono.value).id,"GET");
    fillCombo(cmbCategory, "Select Category", categories, "name");
    cmbCategory.removeAttribute("disabled", "disabled");
    cmbCategory.style.border = initial;

    items = httpRequest("../item/listbyporder?porderid="+JSON.parse(cmbPono.value).id,"GET");
    fillCombo(cmbItem, "Select Item", items, "itemname");
    cmbItem.removeAttribute("disabled", "disabled");

    //when change before inneradd
    refreshInnerForm();
}

function cmbCategoryCH() {
    cmbCategory.style.border = valid;
    items = httpRequest("../item/listbypordercategory?porderid="+JSON.parse(cmbPono.value).id+"&categoryid="+JSON.parse(cmbCategory.value).id,"GET");
    fillCombo(cmbItem, "Select Item", items, "itemname");
    cmbItem.removeAttribute("disabled", "disabled");

    //when change before inneradd
    refreshInnerForm();
}

function cmbItemCH() {
    //get item list by given porder
    porderitem = httpRequest("../porderitem/bypoitem?itemid="+JSON.parse(cmbItem.value).id+"&porderid="+JSON.parse(cmbPono.value).id,"GET");
    txtQty.value = porderitem.qty;
    txtQty.style.border = valid;
    grnbatch.recievedqty = txtQty.value;

    txtPprice.value = parseFloat(porderitem.pprice).toFixed(2);
    txtPprice.style.border = valid;
    batch.purchaseprice = txtPprice.value;
    txtPprice.disabled = false;

    txtLinetotal.value = parseFloat(porderitem.linetotal).toFixed(2);
    txtLinetotal.style.border = valid;
    grnbatch.linetotal =  txtLinetotal.value;
    txtLinetotal.disabled=true;

    //To Change lineTotal
    if(txtQty.value!="") {
        txtLinetotal.value = toDecimal(parseFloat(txtPprice.value) * parseFloat(txtQty.value), 2);
        txtLinetotal.style.border = valid;
        txtLinetotal.setAttribute("disabled", "disabled");
    }
}

//To Change lineTotal
function txtQtyMC() {
    txtLinetotal.value =   toDecimal(parseFloat(txtPprice.value)* parseFloat(txtQty.value));
    txtLinetotal.style.border = valid;
    txtLinetotal.setAttribute("disabled", "disabled");
}

//To Change lineTotal
function txtPpriceKU() {
    if(txtQty.value!=""){
        txtLinetotal.value = toDecimal(parseFloat(txtPprice.value) * parseFloat(txtQty.value),2);
        txtLinetotal.style.border = valid;
        txtLinetotal.setAttribute("disabled", "disabled");
    }
}

function txtBatchcodeKU() {
    batches = httpRequest("../batch/grnlist", "GET");
    // console.log(JSON.parse(cmbItem.value).id);
    for(index in batches){
        if (batches[index].batchcode == txtBatchcode.value){
            // console.log(batch.marketprice);

            txtSprice.value = toDecimal(batches[index].salesprice);
            grnbatch.salesprice = txtSprice.value;
            txtSprice.style.border = valid;

            txtMprice.value = batches[index].marketprice;
            grnbatch.marketprice = txtMprice.value;
            txtMprice.style.border = valid;

            txtMnfdate.value = batches[index].mnfdate;
            grnbatch.mnfdate = txtMnfdate.value;
            txtMnfdate.style.border = valid;

            txtExpdate.value = batches[index].expdate;
            grnbatch.expdate = txtExpdate.value;
            txtExpdate.style.border = valid;

        }else{
            txtMprice.value = "";
            txtMprice.style.border = initial;
            txtSprice.value = "";
            txtSprice.style.border = initial;
            txtMnfdate.value = "";
            txtMnfdate.style.border = initial;
            txtExpdate.value = "";
            txtExpdate.style.border = initial;
        }
    }


    // batch = httpRequest("../batch/byitem?itemid="+JSON.parse(cmbItem.value).id, "GET");
    //
    // txtSprice.value = parseFloat(batch.salesprice).toFixed(2);
    // batch.salesprice = txtSprice.value;
    // txtSprice.style.border = valid;
}

function  refreshInnerForm() {
    total = 0.00;

    grnbatch = new Object();
    oldgrnbatch = null;
    batch =  new Object()
    oldbatch = null;

    fillCombo(cmbItem,"Select Item",items,"itemname","");
    $('.select2-container').css('border', '3px solid #d6d6c2');

    txtQty.value = "";
    txtQty.style.border = initial;

    txtPprice.value = "";
    txtPprice.style.border = initial;

    txtLinetotal.value = "";
    txtLinetotal.style.border = initial;

    txtBatchcode.value = "";
    txtBatchcode.style.border = initial;

    txtSprice.value = "";
    txtSprice.style.border = initial;

    txtMprice.value = "";
    txtMprice.style.border = initial;

    txtMnfdate.value = "";
    txtMnfdate.style.border = initial;

    txtExpdate.value = "";
    txtExpdate.style.border = initial;

    txtLinetotal.removeAttribute("disabled", "disabled");

    fillInnerTable("tblInnerItem", grn.grnBatchList, mdifyInnerForm, deleteInnerForm);

    if (grn.grnBatchList.length != 0) {
        for (index in grn.grnBatchList){
            total = parseFloat(total) + parseFloat(grn.grnBatchList[index].linetotal);
        }

        txtGrandtotal.value = parseFloat(total).toFixed(2);
        txtGrandtotal.style.border = valid;
        txtGrandtotal.setAttribute("disabled", "disabled");
        grn.grandtotal = parseFloat(total).toFixed(2);
    }else{
        txtGrandtotal.value = "";
        grn.grandtotal = null;
    }

    btnInnerUpdate.setAttribute("disabled", "disabled");
    $('#btnInnerUpdate').css('cursor','not-allowed');

    btnInnerAdd.removeAttribute("disabled", "disabled");
    $('#btnInnerAdd').css('cursor','pointer');

}

function innergetErrors() {
    var errors = "";
    addvalue = "";

    if (cmbItem.value == ""){
        errors = errors + "\n" + "Item Not Selected";
        $('.select2-container').css('border', '3px solid red');
    }
    else  addvalue = 1;

    if (txtPprice.value == ""){
        txtPprice.style.border = invalid;
        errors = errors + "\n" + "Purchase Price Not Enter";
    }
    else  addvalue = 1;

    if (txtQty.value == ""){
        txtQty.style.border = invalid;
        errors = errors + "\n" + "Recieved Quantity Not Enter";
    }
    else  addvalue = 1;

    if (txtBatchcode.value == ""){
        txtBatchcode.style.border = invalid;
        errors = errors + "\n" + "Batch Code Price Not Enter";
    }
    else  addvalue = 1;

    if (txtMprice.value == ""){
        txtMprice.style.border = invalid;
        errors = errors + "\n" + "Market Price Not Enter";
    }
    else  addvalue = 1;

    if (txtSprice.value == ""){
        txtSprice.style.border = invalid;
        errors = errors + "\n" + "Real Price Not Enter";
    }
    else  addvalue = 1;

    if (txtMnfdate.value == ""){
        txtMnfdate.style.border = invalid;
        errors = errors + "\n" + "Manufacture Date Price Not Enter";
    }
    else  addvalue = 1;

    if (txtExpdate.value == ""){
        txtExpdate.style.border = invalid;
        errors = errors + "\n" + "Expire Date Not Enter";
    }
    else  addvalue = 1;

    return errors;
}

function btnInnerAddMC() {
    cmbSupplier.disabled = true;
    cmbPono.disabled = true;
    cmbCategory.disabled = true;

    if(innergetErrors()==""){
        grnbatch.batchId = batch;
        //batch.supplierId = JSON.parse(cmbSupplier.value);

        grnbatch.linetotal = toDecimal(parseFloat(txtPprice.value)* parseFloat(txtQty.value),2);

        batch.purchaseprice = toDecimal(txtPprice.value,2);
        batch.salesprice = toDecimal(txtSprice.value,2);
        batch.marketprice = toDecimal(txtMprice.value,2);

        itemexs = false;
        for(index in grn.grnBatchList){
            if(grn.grnBatchList[index].batchId.itemId.itemname == JSON.parse(cmbItem.value).itemname && grn.grnBatchList[index].batchId.batchcode == JSON.parse(txtBatchcode.value)){
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
            grn.grnBatchList.push(grnbatch);
            refreshInnerForm();
            if (grn.grnBatchList.length != null) {
                itemFlied.style.border = valid;
                itemFliedLegend.style.border = valid;
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

function getInnerUpdate(grnbatch) {
    var updates = "";

    if (grnbatch.batchId.itemId.itemname != JSON.parse(cmbItem.value).itemname)
        updates = updates + "\nItems are Changed";

    if (grnbatch.batchId.purchaseprice != txtPprice.value)
        updates = updates + "\nPurchase Price is Changed";

    if (grnbatch.recievedqty != txtQty.value)
        updates = updates + "\nRecieved Quantity is Changed";

    if (grnbatch.recievedqty != txtQty.value)
        updates = updates + "\nLine Total is Changed";

    if (grnbatch.batchId.batchcode != txtBatchcode.value)
        updates = updates + "\nBatch Code is Changed";

    if (grnbatch.batchId.marketprice != txtMprice.value)
        updates = updates + "\nMarket Price is Changed";

    if (grnbatch.batchId.salesprice != txtSprice.value)
        updates = updates + "\nSales Price is Changed";

    if (grnbatch.batchId.mnfdate != txtMnfdate.value)
        updates = updates + "\nManufacture Date is Changed";

    if (grnbatch.batchId.expdate != txtExpdate.value)
        updates = updates + "\nExpire Date is Changed";

    return updates;
}

function btnInnerUpdateMC(){
    var errors = innergetErrors();
    if (errors == "") {
        innerUpdates = getInnerUpdate(grn.grnBatchList[selectedInnerRow]);

        if(innerUpdates==""){
            swal({
                title:"No thing Updated",
                text: "\n",
                icon: "Recieved Quantity",
                timer: 1200,
            })
        }else{
            swal({
                title: "Are you sure to update following...?",
                text: "\n"+ innerUpdates,
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    itemexs = false;
                    for (index in grn.grnBatchList) {
                        if (grn.grnBatchList[index].batchId.itemId.itemname == JSON.parse(cmbItem.value).itemname) {
                            if(selectedInnerRow != index){
                                itemexs = true;
                                break;
                            }

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
                        grn.grnBatchList[selectedInnerRow].batchId.itemId = JSON.parse(cmbItem.value);
                        grn.grnBatchList[selectedInnerRow].batchId.purchaseprice = txtPprice.value;
                        grn.grnBatchList[selectedInnerRow].recievedqty = txtQty.value;
                        grn.grnBatchList[selectedInnerRow].linetotal = txtLinetotal.value;
                        grn.grnBatchList[selectedInnerRow].batchId.batchcode = txtBatchcode.value;
                        grn.grnBatchList[selectedInnerRow].batchId.salesprice = txtSprice.value;
                        grn.grnBatchList[selectedInnerRow].batchId.marketprice = txtMprice.value;
                        grn.grnBatchList[selectedInnerRow].batchId.mnfdate = txtMnfdate.value;
                        grn.grnBatchList[selectedInnerRow].batchId.expdate = txtExpdate.value;
                        refreshInnerForm();
                    }

                }
            }
        );
        }
    }else
    swal({
        title: 'You have following errors in your form',icon: "error",
        text: '\n '+innergetErrors(),
        button: true,
        closeOnClickOutside: false,
    });


}

function deleteInnerForm(porderitem, index) {

    swal({
        title: "Do you want to remove Item",
        text: "\n",
        icon: "warning",
        buttons : true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if (willDelete) {
            grn.grnBatchList.splice(index,1);
            refreshInnerForm();
            if(grn.grnBatchList.length == 0){
                itemFlied.style.border = invalid;
                itemFliedLegend.style.border = invalid;
            }
        }

    });
}

function btnInnerClearMC(){
    refreshInnerForm();
}

function  mdifyInnerForm(grnbatch,indx) {
    selectedInnerRow = indx;

    fillCombo(cmbItem, "Select Item", items,"itemname",grnbatch.batchId.itemId.itemname);
    $('.select2-container').css('border', '3px solid green');

    txtPprice.value = toDecimal(grnbatch.batchId.purchaseprice,2);
    txtPprice.style.border = valid;

    txtQty.value = grnbatch.recievedqty;
    txtQty.style.border = valid;

    txtLinetotal.value = toDecimal(grnbatch.linetotal,2);
    txtLinetotal.style.border = valid;

    txtBatchcode.value = grnbatch.batchId.batchcode;
    txtBatchcode.style.border = valid;

    txtSprice.value = toDecimal(grnbatch.batchId.salesprice,2);
    txtSprice.style.border = valid;

    txtMprice.value = toDecimal(grnbatch.batchId.marketprice,2);
    txtMprice.style.border = valid;

    txtMnfdate.value = grnbatch.batchId.mnfdate;
    txtMnfdate.style.border = valid;

    txtExpdate .value = grnbatch.batchId.expdate;
    txtExpdate .style.border = valid;

    btnInnerUpdate.removeAttribute("disabled", "disabled");
    $('#btnInnerUpdate').css('cursor','pointer');

    btnInnerAdd.setAttribute("disabled", "disabled");
    $('#btnInnerAdd').css('cursor','not-allowed');

    $("#itemBox").show();
}

function txtDiscountratioMC() {
    txtDiscount.value = toDecimal(parseFloat(txtGrandtotal.value) * (parseFloat(txtDiscountratio.value)/100));
    txtDiscount.style.border = valid;
    grn.discount = txtDiscount.value;
    txtDiscount.disabled = true;

    txtNettotal.value = toDecimal(parseFloat(txtGrandtotal .value) - parseFloat(txtDiscount.value));
    txtNettotal.style.border = valid;
    grn.nettotal = txtNettotal.value;
    txtNettotal.disabled = true;

    if (oldgrn!=null && oldgrn.discountedratio != txtDiscountratio.value) {
        txtDiscount.style.border = updated;
        txtNettotal.style.border = updated;
    }

    }

function txtDiscountMC() {
    txtNettotal.value = toDecimal(parseFloat(txtGrandtotal .value) - parseFloat(txtDiscount.value));
    txtNettotal.style.border = valid;
    grn.nettotal = txtNettotal.value;
    txtNettotal.disabled = true;

    if (oldgrn!=null && oldgrn.discount != txtDiscount.value) {
        txtNettotal.style.border = updated;
    }
}


function getErrors() {
    var errors = "";
    addvalue = "";

    if (cmbSupplier.value == ""){
        errors = errors + "\n" + "Supplier Not Selected";
        cmbSupplier.style.border = invalid;
    }
    else  addvalue = 1;

    if (grn.porderId == null){
        errors = errors + "\n" + "Purchase Order Not Selected";
        cmbPono.style.border = invalid;
    }
    else  addvalue = 1;

    if (grn.grnBatchList.length == 0){
        errors = errors + "\n" + "Item Not Selected";
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }
    else  addvalue = 1;

    if (grn.grandtotal == null){
        errors = errors + "\n" + "Grand Total Not Enter";
        txtGrandtotal.style.border = invalid;
    }
    else  addvalue = 1;

    if (grn.discount == null){
        errors = errors + "\n" + "Discount Not Enter";
        txtDiscount.style.border = invalid;
    }
    else  addvalue = 1;

    if (grn.nettotal == null){
        errors = errors + "\n" + "Net Total Not Enter";
        txtNettotal.style.border = invalid;
    }
    else  addvalue = 1;

    if (grn.receiveddate == null){
        errors = errors + "\n" + "Recieved Date Not Enter";
        txtRecieveddate.style.border = invalid;
    }
    else  addvalue = 1;

    return errors;
}

function btnAddMC(){
    if(getErrors()==""){
        if(txtDescription.value=="" || txtDiscountratio.value ==""){
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
    console.log(grn);

    swal({
        title: "Are you sure to add following GRN...?" ,
        text :  "\nGRN Number : " + grn.grnno +
            "\nSupplier Invoice No : " + grn.supinvoiceno +
            "\nSupplier : " + grn.porderId.supplierId.sname +
            "\nPurchase Order Number : " + grn.porderId.pono +
            "\nGrand Total : " + grn.grandtotal +
            "\nDiscount Ratio : " + grn.discountedratio +
            "\nDiscount Amount " + grn.discount +
            "\nNet Total" + grn.nettotal +
            "\nOrder Status  : " + grn. grnstatusId.name +
            "\nOrder Date : " + grn.addeddate +
            "\nOrdered By : " + grn.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willAdd) => {
        if (willAdd) {
            var response = httpRequest("/grn", "POST", grn);
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

    if(oldgrn == null && addvalue == ""){
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

    if(oldgrn==null){
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


function fillForm(gr,rowno){
    activerowno = rowno;

    clearSelection(tblGrn);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblGrn,activerowno,active);

    grn = JSON.parse(JSON.stringify(gr));
    oldgrn = JSON.parse(JSON.stringify(gr));

    cmbSupplier.setAttribute("disabled", "disabled");
    cmbItem.removeAttribute("disabled", "disabled");
    cmbGrnstatus.removeAttribute("disabled", "disabled");

    txtGrnno.value = grn.grnno;
    txtSupplierno.value = grn.supinvoiceno;
    txtGrandtotal.value = grn.grandtotal;
    txtDiscountratio.value = grn.discountedratio;
    txtDiscount.value = toDecimal(grn.discount,2);
    txtNettotal.value = toDecimal(grn.nettotal,2);
    txtNettotal.disabled = true;
    txtRecieveddate.value = grn.receiveddate;
    txtDescription.value = grn.description;
    dteOrderdate.value = grn.addeddate;

    fillCombo(cmbSupplier, "", suppliers, "sname",grn.porderId.supplierId.sname);
    fillCombo(cmbPono, "", porders, "pono",grn.porderId.pono);

    fillCombo(cmbGrnstatus, "", grnstatuses, "name",grn.grnstatusId.name);
    fillCombo(cmbEmployeeOrdered, "", employeeordered, "callingname", grn.employeeId.callingname);

    refreshInnerForm();

    if(grn.grnBatchList.length != 0)
        for(var i=0; i<tblInnerItem.children[1].children.length; i++){
            tblInnerItem.children[1].children[i].lastChild.lastChild.style.display = "none";
        }

    if(grn.grnBatchList.length != null){
        itemFlied.style.border = valid;
        itemFliedLegend.style.border = valid;
    }else {
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }

    $("#itemBox").hide();
    $("#btnInner").hide();

    setStyle(valid);

    if (grn.categoryId != null) {
        fillCombo(cmbCategory, "", categories, "name",grn.categoryId.name);
        cmbCategory.style.border = valid;
    }else{
        fillCombo(cmbCategory, "Select Category", categories, "name");
        cmbCategory.style.border = initial;
    }

    if(txtDiscount.value != null){
        txtDiscount.disabled = true;
    }else {
        txtDiscount.disabled = false;
    }

    if (grn.description == null) {
        fldDescription.style.border = initial;
    }

    if (grn.supinvoiceno == null) {
        txtSupplierno.style.border = initial;
    }

    if (grn.discountedratio == null) {
        txtDiscountratio.style.border = initial;
    }



}

function getUpdates() {

    var updates = "";

    if(grn!=null && oldgrn!=null) {

        if (grn.supinvoiceno != oldgrn.supinvoiceno)
            updates = updates + "\nSupplier Invoice No is Changed";

        if (grn.discountedratio != oldgrn.discountedratio)
            updates = updates + "\nDiscount Ratio is Changed";

        if (grn.discount != oldgrn.discount)
            updates = updates + "\nDiscount Amount is Changed";

        if (grn.nettotal != oldgrn.nettotal)
            updates = updates + "\nNet Total is Changed";

        if (grn.receiveddate != oldgrn.receiveddate)
            updates = updates + "\nRecieved Date is Changed";

        if (grn.description != oldgrn.description)
            updates = updates + "\nDescription is Changed";

        if (grn.grnstatusId.name != oldgrn.grnstatusId.name)
            updates = updates + "\nGRN Status is Changed";

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
                title: "Are you sure to update following GRN details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/grn", "PUT", grn);
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

function btnDeleteMC(gr) {
    grn = JSON.parse(JSON.stringify(gr));

    swal({
        title: "Are you sure to delete following GRN...?",
        text :  "\nGRN Number : " + grn.grnno +
            "\nSupplier Invoice No : " + grn.supinvoiceno +
            "\nSupplier : " + grn.porderId.supplierId.sname +
            "\nPurchase Order Number : " + grn.porderId.pono +
            "\nGrand Total : " + grn.grandtotal +
            "\nDiscount Ratio : " + grn.discountedratio +
            "\nDiscount Amount " + grn.discount +
            "\nNet Total: " + grn.nettotal +
            "\nOrder Status  : " + grn. grnstatusId.name +
            "\nOrder Date : " + grn.addeddate +
            "\nOrdered By : " + grn.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/grn","DELETE",grn);
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

function btnPrintTableMC(grn) {

    var newwindow=window.open();
    formattab = tblGrn.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Goods Received Note Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(grind) {
    cindex = grind;

    var grprop = tblGrn.firstChild.firstChild.children[cindex].getAttribute('property');

    if(grprop.indexOf('.') == -1) {
        grns.sort(
            function (a, b) {
                if (a[grprop] < b[grprop]) {
                    return -1;
                } else if (a[grprop] > b[grprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        grns.sort(
            function (a, b) {
                if (a[grprop.substring(0,grprop.indexOf('.'))][grprop.substr(grprop.indexOf('.')+1)] < b[grprop.substring(0,grprop.indexOf('.'))][grprop.substr(grprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[grprop.substring(0,grprop.indexOf('.'))][grprop.substr(grprop.indexOf('.')+1)] > b[grprop.substring(0,grprop.indexOf('.'))][grprop.substr(grprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblGrn',grns,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblGrn);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblGrn,activerowno,active);



}




