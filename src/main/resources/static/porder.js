window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    $(document).ready(function() {
        $('.js-example-basic-single').select2();
    });

    txtSearchname.addEventListener("keyup",btnSearchMC);
    cmbSupplier.addEventListener("change", cmbSupplierCH);
    cmbCategory.addEventListener("change", cmbCategoryCH);
    cmbItem.addEventListener("change",cmbItemCH);
    txtQty.addEventListener("keyup", txtQtyMC);
    txtpprice.addEventListener("keyup", txtppriceKU);

    privilages = httpRequest("../privilage?module=PORDER","GET");

    //Data services for Combo Boxes
    suppliers = httpRequest("../supplier/list","GET");
    activesuppliers = httpRequest("../supplier/activelist","GET");
    categories = httpRequest("../category/list","GET");
    porderstatuses = httpRequest("../porderstatus/list","GET");
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
    porders = new Array();
    var data = httpRequest("/porder/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) porders = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblPorder',porders,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblPorder);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblPorder,activerowno,active);

}

function selectDeleteRow() {
    for(index in porders){
        if(porders[index].porderstatusId.name =="Canceled"){
            tblPorder.children[1].children[index].style.color = "#f00";
            tblPorder.children[1].children[index].style.fontWeight = "bold";
            tblPorder.children[1].children[index].lastChild.children[1].disabled = true;
            tblPorder.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }

        if (porders[index].porderstatusId.name == "Completed") {
            tblPorder.children[1].children[index].lastChild.children[0].disabled = true;
            tblPorder.children[1].children[index].lastChild.children[0].style.cursor = "not-allowed";
            tblPorder.children[1].children[index].lastChild.children[1].disabled = true;
            tblPorder.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if(oldporder==null){
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

function viewitem(por,rowno) {

    porder = JSON.parse(JSON.stringify(por));

    tbPodernumber.innerHTML = porder.pono;
    tbSupplier.innerHTML = porder.supplierId.sname;
    fillInnerTable("tblPrintInnerItem", porder.porderItemList,mdifyInnerForm , deleteInnerForm);
    tbTotalprice.innerHTML = toDecimal(porder.totalprice,2);
    tbDescription.innerHTML = porder.description;
    tbPoderstatus.innerHTML = porder.employeeId.callingname;
    tbOrderdate.innerHTML = porder.date;
    tbEmployeeOrdered.innerHTML = porder.employeeId.callingname;

}

function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Purchase Order Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

function loadForm() {
    porder = new Object();
    oldporder = null;

    porder.porderItemList = new Array();

    fillCombo(cmbSupplier, "Select Supplier", activesuppliers, "sname");
    cmbSupplier.removeAttribute("disabled", "disabled");

    fillCombo(cmbCategory, "Select Category", categories, "name");
    cmbCategory.setAttribute("disabled", "disabled");

    fillCombo(cmbPoderstatus, "", porderstatuses, "name", "Pending");
    porder.porderstatusId = JSON.parse(cmbPoderstatus.value);

    fillCombo(cmbEmployeeOrdered, "", employeeordered, "callingname", session.getObject('activeuser').employeeId.callingname);
    porder.employeeId = JSON.parse(cmbEmployeeOrdered.value);
    cmbEmployeeOrdered.disabled="disabled";

    var today = new Date();
    var month = today.getMonth()+1;
    if(month<10) month = "0"+month;
    var date = today.getDate();
    if(date<10) date = "0"+date;

    dteOrderdate.value=today.getFullYear()+"-"+month+"-"+date;
    porder.date=dteOrderdate.value;
    dteOrderdate.disabled="disabled";

    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/porder/nextnumber", "GET");
    txtPodernumber.value = nextNumber.pono;
    porder.pono = txtPodernumber.value;
    txtPodernumber.disabled="disabled";

    cmbItem.setAttribute("disabled", "disabled");
    cmbPoderstatus.setAttribute("disabled", "disabled");
    $("#chkClose").prop("checked", false);


    txtTotalprice.value = "";
    txtTotalprice.disabled = false;
    txtDescription.value = "";

    setStyle(initial);
    txtPodernumber.style.border=valid;
    cmbPoderstatus.style.border=valid;
    dteOrderdate.style.border=valid;
    cmbEmployeeOrdered.style.border=valid;
    txtRoq.style.border=initial;
    itemFlied.style.border = initial;
    itemFliedLegend.style.border = initial;

    disableButtons(false, true, true);

    refreshInnerForm();
}

function  refreshInnerForm() {
    total = 0.00;

    porderitem = new Object();

    fillCombo(cmbItem,"Select Item",items,"itemname","");
    $('.select2-container').css('border', '3px solid #d6d6c2');

    txtQty.value = "";
    txtQty.style.border = initial;

    txtpprice.value = "";
    txtpprice.style.border = initial;

    txtlinetotal.value = "";
    txtlinetotal.style.border = initial;
    txtlinetotal.removeAttribute("disabled", "disabled");

    txtRoq.value = "";
    txtRoq.disabled = true;
    txtRoq.style.border=initial;

    fillInnerTable("tblInnerItem", porder.porderItemList, mdifyInnerForm, deleteInnerForm);

    if (porder.porderItemList.length != 0) {
        for (index in porder.porderItemList){
            total = parseFloat(total) + parseFloat(porder.porderItemList[index].linetotal);
        }

        txtTotalprice.value = toDecimal(total,2);
        txtTotalprice.style.border = valid;
        txtTotalprice.setAttribute("disabled", "disabled");
        porder.totalprice = txtTotalprice.value;
    }else{
        txtTotalprice.value = "";
        porder.totalprice = null;
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

    if (txtpprice.value == ""){
        txtpprice.style.border = invalid;
        errors = errors + "\n" + "Purchase Price Not Enter";
    }
    else  addvalue = 1;

    if (txtQty.value == ""){
        txtQty.style.border = invalid;
        errors = errors + "\n" + "Quantity Not Enter";
    }
    else  addvalue = 1;

    return errors;
}

function btnInnerAddMC() {
    if(innergetErrors()==""){

        if (isNaN(parseFloat(txtQty.value))){
            txtQty.value = "";
            txtQty.style.border = invalid;
            swal({
                title: "Quantity should be a number",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }else {
            if (parseFloat(txtQty.value) < 0) {
                txtQty.value = "";
                txtQty.style.border = invalid;
                swal({
                    title: "Quantity can't be a negative number",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else if (parseFloat(txtQty.value) == 0) {
                txtQty.value = "";
                txtQty.style.border = invalid;
                swal({
                    title: "Quantity 0 can't Add",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else {
                cmbSupplier.disabled = "disabled";

                porderitem.qty = txtQty.value;
                porderitem.pprice = toDecimal(txtpprice.value, 2);

                porderitem.linetotal = toDecimal(parseFloat(txtpprice.value) * parseFloat(txtQty.value), 2)
                porderitem.itemId = JSON.parse(cmbItem.value);

                itemexs = false;
                for (index in porder.porderItemList) {
                    if (porder.porderItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname) {
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
                    porder.porderItemList.push(porderitem);
                    refreshInnerForm();

                    if (porder.porderItemList.length != null) {
                        itemFlied.style.border = valid;
                        itemFliedLegend.style.border = valid;
                    }

                    if (oldporder != null && isEqual(porder.porderItemList, oldporder.porderItemList, 'itemId')) {
                        itemFlied.style.border = updated;
                        itemFliedLegend.style.border = updated;
                    }

                    if (oldporder != null && porder.totalprice != oldporder.totalprice) {
                        txtTotalprice.style.border = updated;
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

function getInnerUpdate(porderitem) {
    var updates = "";

    if (porderitem.itemId.itemname != JSON.parse(cmbItem.value).itemname)
        updates = updates + "\nItems are Changed";

    if (porderitem.pprice != txtpprice.value)
        updates = updates + "\npurchase Price is Changed";

    if (porderitem.qty != txtQty.value)
        updates = updates + "\nQuantity is Changed";

    if (porderitem.linetotal != txtlinetotal.value)
        updates = updates + "\nLine Total is Changed";



    return updates;
}

function btnInnerUpdateMC(){
    var errors = innergetErrors();
    if (errors == "") {
        if (isNaN(parseFloat(txtQty.value))){
            txtQty.value = "";
            txtQty.style.border = invalid;
            swal({
                title: "Quantity should be a number",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }else {
            if (parseFloat(txtQty.value) < 0) {
                txtQty.value = "";
                txtQty.style.border = invalid;
                swal({
                    title: "Quantity can't be a negative number",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else if (parseFloat(txtQty.value) == 0) {
                txtQty.value = "";
                txtQty.style.border = invalid;
                swal({
                    title: "Quantity 0 can't Add",
                    text: "\n",
                    icon: "warning",
                    buttons: true,
                })
            } else {
                innerUpdates = getInnerUpdate(porder.porderItemList[selectedInnerRow]);

                if (innerUpdates == "") {
                    swal({
                        title: "No thing Updated",
                        text: "\n",
                        icon: "warning",
                        timer: 1200,
                    })
                } else {
                    swal({
                        title: "Are you sure to update following...?",
                        text: "\n" + innerUpdates,
                        icon: "warning", buttons: true, dangerMode: true,
                    })
                        .then((willUpdate) => {
                                if (willUpdate) {
                                    itemexs = false;
                                    for (index in porder.porderItemList) {
                                        if (porder.porderItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname) {
                                            if (selectedInnerRow != index) {
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
                                        porder.porderItemList[selectedInnerRow].itemId = JSON.parse(cmbItem.value);
                                        porder.porderItemList[selectedInnerRow].qty = txtQty.value;
                                        porder.porderItemList[selectedInnerRow].pprice = txtpprice.value;
                                        porder.porderItemList[selectedInnerRow].linetotal = txtlinetotal.value;
                                        refreshInnerForm();

                                        if (isEqual(porder.porderItemList, oldporder.porderItemList, 'itemId')) {
                                            itemFlied.style.border = updated;
                                            itemFliedLegend.style.border = updated;

                                        }
                                        if (porder.totalprice != oldporder.totalprice) {
                                            txtTotalprice.style.border = updated;
                                        }

                                    }

                                }
                            }
                        );
                }
            }
        }
    }
    else
        swal({
            title: 'You have following errors in your form',icon: "error",
            text: '\n '+innergetErrors(),
            button: true,
            closeOnClickOutside: false,
        });

}

function btnInnerClearMC(){
    refreshInnerForm();
    cmbCategory.style.background = "ash";
    cmbCategory.value = "";
    cmbCategory.style.border = initial;
}

function  mdifyInnerForm(porderitem,indx) {
    selectedInnerRow = indx;

    fillCombo(cmbCategory, "Select Category", categories, "name",porderitem.itemId.subcategoryId.categoryId.name);
    cmbCategory.style.border = valid;

    items = httpRequest("../item/list","GET");
    fillCombo(cmbItem, "Select Item", items,"itemname",porderitem.itemId.itemname);
    $('.select2-container').css('border', '3px solid green');

    txtQty.value = porderitem.qty;
    txtQty.style.border = valid;

    txtpprice.value = toDecimal(porderitem.pprice,2);
    txtpprice.style.border = valid;

    txtlinetotal.value = toDecimal(porderitem.linetotal,2);
    txtlinetotal.style.border = valid;
    txtlinetotal.disabled=true;

    txtRoq.value = porderitem.itemId.roq;
    txtRoq.style.border = valid;

    btnInnerUpdate.removeAttribute("disabled", "disabled");
    $('#btnInnerUpdate').css('cursor','pointer');

    btnInnerAdd.setAttribute("disabled", "disabled");
    $('#btnInnerAdd').css('cursor','not-allowed');

}

function deleteInnerForm(porderitem, index) {

    swal({
        title: "Do you want to remove Item",
        text: "\n",
        icon: "warning",
        buttons : true,
    }).then((willDelete) => {
        if (willDelete) {
            porder.porderItemList.splice(index,1);
            refreshInnerForm();
            if(porder.porderItemList.length == 0){
                itemFlied.style.border = invalid;
                itemFliedLegend.style.border = invalid;
            }
        }

    });

}

function setStyle(style) {

    txtPodernumber.style.border = style;
    cmbSupplier.style.border = style;
    cmbCategory.style.border = style;
    txtTotalprice.style.border = style;
    txtDescription.style.border = style;
    cmbPoderstatus.style.border = style;
    dteOrderdate.style.border = style;
    cmbEmployeeOrdered.style.border = style;

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
    //get item list by given supplier
    categories = httpRequest("../category/listbysupplier?supplierid="+JSON.parse(cmbSupplier.value).id,"GET");
    fillCombo(cmbCategory, "Select Category", categories, "name");

    items = httpRequest("../item/listbysupplier?supplierid="+JSON.parse(cmbSupplier.value).id,"GET");
    fillCombo(cmbItem, "Select Item", items, "itemname");
    cmbItem.removeAttribute("disabled", "disabled");

    //when change before inneradd
    cmbCategory.removeAttribute("disabled", "disabled");
    cmbCategory.style.border=initial;
    refreshInnerForm();
}

function cmbCategoryCH() {
    cmbCategory.style.border = valid;
    cmbCategory.style.background = "lightcyan";
    items = httpRequest("../item/listbysuppliercategory?supplierid="+JSON.parse(cmbSupplier.value).id+"&categoryid="+JSON.parse(cmbCategory.value).id,"GET");
    fillCombo(cmbItem, "Select Item", items, "itemname");
    cmbItem.removeAttribute("disabled", "disabled");

    txtRoq.value = "";
    txtRoq.style.border=initial;

    //when change before inneradd
    refreshInnerForm();
}

function cmbItemCH() {
    txtRoq.value = porderitem.itemId.roq;
    txtRoq.style.border = valid;
    txtRoq.style.background = "lightcyan";
    txtRoq.disabled = true;

    batch = httpRequest("../batch/byitem?itemid="+JSON.parse(cmbItem.value).id, "GET");

    console.log(parseFloat(batch.purchaseprice).toFixed(2));

    if(batch.purchaseprice != null && parseFloat(batch.purchaseprice).toFixed(2) != 0.00){
        txtpprice.value = parseFloat(batch.purchaseprice).toFixed(2);
        porderitem.purchaseprice = txtpprice.value;
        txtpprice.style.border = valid;
    }else{
        txtpprice.value = "";
        txtpprice.style.border = initial;
    }



    //To Change lineTotal
    if(txtQty.value!="") {
        txtlinetotal.value = toDecimal(parseFloat(txtpprice.value) * parseFloat(txtQty.value), 2);
        txtlinetotal.style.border = valid;
        txtlinetotal.setAttribute("disabled", "disabled");
    }
}

//To Change lineTotal
function txtQtyMC() {
    txtlinetotal.value = toDecimal(parseFloat(txtpprice.value) * parseFloat(txtQty.value),2);
    txtlinetotal.style.border = valid;
    txtlinetotal.setAttribute("disabled", "disabled");
}

//To Change lineTotal
function txtppriceKU() {
    if (isNaN(parseFloat(txtpprice.value))){
        txtpprice.value = "";
        txtpprice.style.border = invalid;
        swal({
            title: "Purchase Price is not allowed",
            text: "\n",
            icon: "warning",
            buttons: true,
        })
    }else {
        if (parseFloat(txtpprice.value) < 0) {
            txtpprice.value = "";
            txtpprice.style.border = invalid;
            swal({
                title: "Purchase Price can't be a negative",
                text: "\n",
                icon: "warning",
                buttons: true,
            })
        }  else {
            if (txtQty.value != "") {
                txtlinetotal.value = toDecimal(parseFloat(txtpprice.value) * parseFloat(txtQty.value), 2);
                txtlinetotal.style.border = valid;
                txtlinetotal.setAttribute("disabled", "disabled");
            }
        }
    }
}



function getErrors() {
    var errors = "";
    addvalue = "";

    if (porder.supplierId == null) {
        errors = errors + "\n" + "Supplier Not Selected";
        cmbSupplier.style.border = invalid;
    }
    else  addvalue = 1;

    if (porder.porderItemList.length == 0) {
        errors = errors + "\n" + "Item Not Selected";
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }
    else  addvalue = 1;

    if (porder.totalprice == null) {
        errors = errors + "\n" + "Total Price Not Enter";
        txtTotalprice.style.border = invalid;
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
    swal({
        title: "Are you sure to add following Purchase Order...?" ,
        text :  "\nPurchase Order Number : " + porder.pono +
            "\nSupplier : " + porder.supplierId.sname +
            "\nTotal Price : " + porder.totalprice +
            "\nOrder Status  : " + porder.porderstatusId.name +
            "\nOrder Date : " + porder.date +
            "\nOrdered By : " + porder.employeeId.callingname,
        icon: "resourse/image/porder.png",
        buttons: [
            'No, Cancel',
            'Yes, Save!'
        ],
        closeOnClickOutside: false,
    }).then((willAdd) => {
        if (willAdd) {
            var response = httpRequest("/porder", "POST", porder);
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
                button: true
            });
        }
    });

}

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if(oldporder == null && addvalue == ""){
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

    if(oldporder==null){
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


function fillForm(por,rowno){
    activerowno = rowno;

    clearSelection(tblPorder);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblPorder,activerowno,active);

    porder = JSON.parse(JSON.stringify(por));
    oldporder = JSON.parse(JSON.stringify(por));

    cmbSupplier.disabled="disabled";
    cmbItem.removeAttribute("disabled", "disabled");
    cmbPoderstatus.removeAttribute("disabled", "disabled");
    cmbCategory.removeAttribute("disabled", "disabled");

    txtPodernumber.value = porder.pono;
    txtTotalprice.value = porder.totalprice;
    txtDescription.value = porder.description;
    dteOrderdate.value = porder.date;

    fillCombo(cmbSupplier, "", suppliers, "sname",porder.supplierId.sname);
    fillCombo(cmbPoderstatus, "", porderstatuses, "name",porder.porderstatusId.name);
    fillCombo(cmbEmployeeOrdered, "", employeeordered, "callingname", porder.employeeId.callingname);

    refreshInnerForm();
    if(porder.porderItemList.length != null){
        itemFlied.style.border = valid;
        itemFliedLegend.style.border = valid;
    }else {
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }

    setStyle(valid);
    cmbCategory.style.border=initial;

    if (porder.description == null) {
        txtDescription.style.border = initial;
    }

    // for filtering
    categories = httpRequest("../category/listbysupplier?supplierid="+JSON.parse(cmbSupplier.value).id,"GET");
    fillCombo(cmbCategory, "Select Category", categories, "name");

    items = httpRequest("../item/listbysupplier?supplierid="+JSON.parse(cmbSupplier.value).id,"GET");
    fillCombo(cmbItem, "Select Item", items, "itemname");


}

function getUpdates() {
    var updates = "";

    if(porder!=null && oldporder!=null) {
        if(isEqual(porder.porderItemList, oldporder.porderItemList,"itemId"))
            updates = updates + "\nItems are Changed";

        if (porder.totalprice != oldporder.totalprice)
            updates = updates + "\nTotal Price is Changed";

        if (porder.description != oldporder.description)
            updates = updates + "\nDescription is Changed";

        if (porder.porderstatusId.name != oldporder.porderstatusId.name)
            updates = updates + "\nOrder Status is Changed";

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
                title: "Are you sure to update following Purchase Order details...?",
                text: "\n"+ getUpdates(),
                icon: "resourse/image/porderup.png",
                buttons: ['No, Cancel', 'Yes, Update!'],
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/porder", "PUT", porder);
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
                    else swal({
                        title: 'Update not Success... , You have following errors', icon: "error",
                        text: '\n ' + response,
                        button: true
                    });
                }
            });
        }
    }
    else
        swal({
            title: 'You have following errors in your form',icon: "error",
            text: '\n '+getErrors(),
            button: true});

}

function btnDeleteMC(por) {
    porder = JSON.parse(JSON.stringify(por));

    swal({
        title: "Are you sure to delete following Purchase Order...?",
        text :  "\nPurchase Order Number : " + porder.pono +
            "\nSupplier : " + porder.supplierId.sname +
            "\nTotal Price : " + porder.totalprice +
            "\nOrder Status  : " + porder.porderstatusId.name +
            "\nOrder Date : " + porder.date +
            "\nOrdered By : " + porder.employeeId.callingname,
        icon: "resourse/image/porderdel.png",
        buttons: ['No, Cancel', 'Yes, Delete it!'],
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete)=> {
        if (willDelete) {
            var responce = httpRequest("/porder","DELETE",porder);
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

function btnPrintTableMC(porder) {

    var newwindow=window.open();
    formattab = tblPorder.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Purchase Order Details</h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(pind) {
    cindex = pind;

    var poprop = tblPorder.firstChild.firstChild.children[cindex].getAttribute('property');

    if(poprop.indexOf('.') == -1) {
        porders.sort(
            function (a, b) {
                if (a[poprop] < b[poprop]) {
                    return -1;
                } else if (a[poprop] > b[poprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        porders.sort(
            function (a, b) {
                if (a[poprop.substring(0,poprop.indexOf('.'))][poprop.substr(poprop.indexOf('.')+1)] < b[poprop.substring(0,poprop.indexOf('.'))][poprop.substr(poprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[poprop.substring(0,poprop.indexOf('.'))][poprop.substr(poprop.indexOf('.')+1)] > b[poprop.substring(0,poprop.indexOf('.'))][poprop.substr(poprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblPorder',porders,fillForm,btnDeleteMC,viewitem);
    clearSelection(tblPorder);
    disableButtons(false, true, true);
    selectDeleteRow();

    if(activerowno!="")selectRow(tblPorder,activerowno,active);

}

