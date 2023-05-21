window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    $(document).ready(function() {
        $('.js-example-basic-single').select2();
    });

    txtSearchname.addEventListener("keyup", btnSearchMC);
    cmbItem.addEventListener("change", cmbItemCH);
    cmbBatch.addEventListener("change", cmbBatchCH);
    txtRqty.addEventListener("keyup", txtRqtyCH);
    cmbCustomer.addEventListener("change", cmbCustomerMC);

    privilages = httpRequest("../privilage?module=CUSTOMERRETURN", "GET");

    //Data services for Combo Boxes
    customers = httpRequest("../customer/activelist", "GET");
    items = httpRequest("../item/list", "GET");
    batches = httpRequest("../batch/list", "GET");
    customerreturnstatuses = httpRequest("../customerreturnstatus/list", "GET");
    employeecreated = httpRequest("../employee/list", "GET");


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
    customerreturns = new Array();
    var data = httpRequest("/customerreturn/findAll?page=" + page + "&size=" + size + query, "GET");
    if (data.content != undefined) customerreturns = data.content;
    createPagination('pagination', data.totalPages, data.number + 1, paginate);
    fillTable('tblCreturn', customerreturns, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblCreturn);
    selectDeleteRow();

    if (activerowno != "") selectRow(tblCreturn, activerowno, active);

}

function selectDeleteRow() {
    for (index in customerreturns) {
        if (customerreturns[index].customerreturnstatusId.name == "Deleted") {
            tblCreturn.children[1].children[index].style.color = "#f00";
            tblCreturn.children[1].children[index].style.fontWeight = "bold";
            tblCreturn.children[1].children[index].lastChild.children[1].disabled = true;
            tblCreturn.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if (oldcustomerreturn == null) {
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
        activerowno = ""
        loadSearchedTable();
        loadForm();
    }

}

function viewitem(cusr, rowno) {

    customerreturn = JSON.parse(JSON.stringify(cusr));

    tbReturnno.innerHTML = customerreturn.returnno;
    tbCustomer.innerHTML = customerreturn.customerId.cname;
    tbTotalaount.innerHTML = toDecimal(customerreturn.totalamount,2);
    tbDescription.innerHTML = customerreturn.description;
    tbDOCreated.innerHTML = customerreturn.date;
    tbReturnstatus.innerHTML = customerreturn.customerreturnstatusId.name;
    tbEmployeeCreated.innerHTML = customerreturn.employeeId.callingname;

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Customer Return Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () {
        printwindow.print();
    }, 100);
}

function loadForm() {
    customerreturn = new Object();
    oldcustomerreturn = null;

    customerreturn.customerReturnItemList = new Array();

    fillCombo3(cmbCustomer,"Select Customer",customers,"regno","cname","");
    // $('.select2-container').css('border', '3px solid #d6d6c2');

    fillCombo(cmbReturnstatus, "", customerreturnstatuses, "name", "Pending");
    customerreturn.customerreturnstatusId = JSON.parse(cmbReturnstatus.value);

    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname",session.getObject('activeuser').employeeId.callingname);
    customerreturn.employeeId = JSON.parse(cmbEmployeeCreated.value);
    cmbEmployeeCreated.disabled = "disabled";

    var today = new Date();
    var month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = today.getDate();
    if (date < 10) date = "0" + date;

    dteDOCreated.value = today.getFullYear() + "-" + month + "-" + date;
    customerreturn.date = dteDOCreated.value;
    dteDOCreated.disabled = "disabled";

    cmbReturnstatus.setAttribute("disabled", "disabled");
    cmbItem.disabled = true;
    spnReturnno.style.visibility="hidden";
    $("#chkClose").prop("checked", false);

    txtReturnno.value = "";
    txtReturnno.disabled = "disabled";
    txtTotalaount.value = "";
    txtTotalaount.disabled = false;
    txtDescription.value = "";

    setStyle(initial);
    txtReturnno.style.border = initial;
    cmbReturnstatus.style.border = valid;
    dteDOCreated.style.border = valid;
    cmbEmployeeCreated.style.border = valid;
    itemFlied.style.border = initial;
    itemFliedLegend.style.border = initial;

    disableButtons(false, true, true);

    refreshInnerForm();
}

function refreshInnerForm() {
    total = 0.00;
    customerreturnitem = new Object();

    fillCombo(cmbItem, "Select Item", items, "itemname", "");
    $('.select2-container').css('border', '3px solid #d6d6c2');

    fillCombo(cmbBatch, "Select Batch", batches, "batchcode", "");
    cmbBatch.style.border = initial;
    cmbBatch.disabled = true;

    txtMprice.value = "";
    txtMprice.style.border = initial;
    txtMprice.disabled = false;

    txtRqty.value = "";
    txtRqty.style.border = initial;

    txtLinetotal.value = "";
    txtLinetotal.style.border = initial;
    txtLinetotal.disabled = false;

    fillInnerTable("tblInnerItem", customerreturn.customerReturnItemList, mdifyInnerForm, deleteInnerForm);

    if (customerreturn.customerReturnItemList.length != 0) {
        for (index in customerreturn.customerReturnItemList) {
            total = parseFloat(total) + parseFloat(customerreturn.customerReturnItemList[index].linetotal);
        }
        txtTotalaount.value = toDecimal(total,2);
        txtTotalaount.style.border = valid;
        txtTotalaount.disabled = true;
        customerreturn.totalamount = txtTotalaount.value;
    } else {
        txtTotalaount.value = "";
        customerreturn.totalprice = null;
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
        cmbItem.style.border = invalid;
    }
    else  addvalue = 1;

    if (cmbBatch.value == ""){
        cmbBatch.style.border = invalid;
        errors = errors + "\n" + "Batch  Not Selected";
    }
    else  addvalue = 1;

    if (txtMprice.value == ""){
        errors = errors + "\n" + "Market Price Not Enter";
        txtMprice.style.border = invalid;
    }
    else  addvalue = 1;

    if (txtRqty.value == ""){
        txtRqty.style.border = invalid;
        errors = errors + "\n" + "Return Quantity Not Enter";
    }
    else  addvalue = 1;

    return errors;
}

function btnInnerAddMC() {
    if(innergetErrors()==""){
        txtMprice.removeAttribute("disabled", "disabled");

        customerreturnitem.rqty = txtRqty.value;
        customerreturnitem.mprice = toDecimal(txtMprice.value,2);

        customerreturnitem.linetotal = toDecimal(parseFloat(txtMprice.value) * parseFloat(txtRqty.value),2)
        customerreturnitem.itemId = JSON.parse(cmbItem.value);
        customerreturnitem.batchId = JSON.parse(cmbBatch.value);

        itemexs = false;
        for (index in customerreturn.customerReturnItemList) {
            if (customerreturn.customerReturnItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname && customerreturn.customerReturnItemList[index].batchId.batchcode == JSON.parse(cmbBatch.value).batchcode) {
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
            customerreturn.customerReturnItemList.push(customerreturnitem);
            refreshInnerForm();
            if (customerreturn.customerReturnItemList.length != null) {
                itemFlied.style.border = valid;
                itemFliedLegend.style.border = valid;
            }

            if (oldcustomerreturn != null && isEqual(customerreturn.customerReturnItemList, oldcustomerreturn.customerReturnItemList, 'itemId')) {
                itemFlied.style.border = updated;
                itemFliedLegend.style.border = updated;
            }

            if (oldcustomerreturn != null){
                if (customerreturn.totalamount != oldcustomerreturn.totalamount){
                    txtTotalaount.style.border = updated;
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

function getInnerUpdate(customerreturnitem) {
    var updates = "";

    if (customerreturnitem.itemId.itemname != JSON.parse(cmbItem.value).itemname)
        updates = updates + "\nItems are Changed";

    if (customerreturnitem.batchId.batchcode != JSON.parse(cmbBatch.value).batchcode)
        updates = updates + "\nItems are Changed";

    if (customerreturnitem.rqty != txtRqty.value)
        updates = updates + "\nQuantity is Changed";

    if (customerreturnitem.mprice != txtMprice.value)
        updates = updates + "\nMarket Price is Changed";

    if (customerreturnitem.linetotal != txtLinetotal.value)
        updates = updates + "\nLine Total is Changed";

    return updates;
}

function btnInnerUpdateMC() {
    var errors = innergetErrors();
    if (errors == "") {
        innerUpdates = getInnerUpdate(customerreturn.customerReturnItemList[selectedInnerRow]);

        if (innerUpdates == "") {
            swal({
                title: "No thing Updated",
                text: "\n",
                icon: "warning",
                buttons: false,
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
                if(willUpdate) {

                    itemexs = false;
                    for (index in customerreturn.customerReturnItemList) {
                        if (customerreturn.customerReturnItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname) {
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
                        customerreturn.customerReturnItemList[selectedInnerRow].itemId = JSON.parse(cmbItem.value);
                        customerreturn.customerReturnItemList[selectedInnerRow].batchId = JSON.parse(cmbBatch.value);
                        customerreturn.customerReturnItemList[selectedInnerRow].rqty = txtRqty.value;
                        customerreturn.customerReturnItemList[selectedInnerRow].mprice = txtMprice.value;
                        customerreturn.customerReturnItemList[selectedInnerRow].linetotal = txtLinetotal.value;
                        refreshInnerForm();
                    }

                }
            }
        );
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

function btnInnerClearMC() {
    refreshInnerForm();
}

function mdifyInnerForm(customerreturnitem, indx) {
    selectedInnerRow = indx;
    fillCombo(cmbItem, "Select Item", items, "itemname", customerreturnitem.itemId.itemname);
    $('.select2-container').css('border', '3px solid green');

    fillCombo(cmbBatch, "Select Batch", batches, "batchcode", customerreturnitem.batchId.batchcode);
    cmbBatch.style.border = valid;

    txtMprice.value = toDecimal(customerreturnitem.mprice,2);
    txtMprice.style.border = valid;
    txtMprice.disabled = true;

    txtRqty.value = customerreturnitem.rqty;
    txtRqty.style.border = valid;

    txtLinetotal.value = toDecimal(customerreturnitem.linetotal,2);
    txtLinetotal.style.border = valid;
    txtLinetotal.disabled = true;

    btnInnerUpdate.removeAttribute("disabled", "disabled");
    $('#btnInnerUpdate').css('cursor','pointer');

    btnInnerAdd.setAttribute("disabled", "disabled");
    $('#btnInnerAdd').css('cursor','not-allowed');
}

function deleteInnerForm(customerreturnitem, index) {

    swal({
        title: "Do you want to remove Customer Return",
        text: "\n",
        icon: "warning",
        buttons: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if(willDelete) {
            customerreturn.customerReturnItemList.splice(index, 1);
            refreshInnerForm();
            if(customerreturn.customerReturnItemList.length == 0){
                itemFlied.style.border = invalid;
                itemFliedLegend.style.border = invalid;
            }
        }

    }
);

}

function setStyle(style) {
    txtReturnno.style.border = style;
    cmbCustomer.style.border = style;
    txtTotalaount.style.border = style;
    fldDescription.style.border = style;
    dteDOCreated.style.border = style;
    cmbReturnstatus.style.border = style;
    cmbEmployeeCreated.style.border = style;
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

function cmbCustomerCH() {
    cmbItem.disabled = false;
}

function cmbItemCH() {
    //get batch list by given item
    batches = httpRequest("../batch/listbyitem?itemid="+JSON.parse(cmbItem.value).id,"GET");
    fillCombo(cmbBatch, "Select Batch", batches, "batchcode", "");
    cmbBatch.disabled = false;
    cmbBatch.style.border = initial;

    txtMprice.value = "";
    txtMprice.style.border = initial;

}

function cmbBatchCH() {
    txtMprice.value =parseFloat(customerreturnitem.batchId.marketprice).toFixed(2);
    txtMprice.style.border = valid;
    txtMprice.disabled = true;

    if(txtRqty.value != ""){
        txtLinetotal.value = (parseFloat(txtMprice.value) * parseFloat(txtRqty.value)).toFixed(2);
        txtLinetotal.style.border = valid;
        txtLinetotal.disabled=true;
    }

}

function txtRqtyCH() {
    txtLinetotal.value = (parseFloat(txtMprice.value) * parseFloat(txtRqty.value)).toFixed(2);
    txtLinetotal.style.border = valid;
    txtLinetotal.disabled=true;

}

function cmbCustomerMC() {
    cmbItem.disabled = false;
}



function getErrors() {
    var errors = "";
    addvalue = "";

    if (customerreturn.customerId == null){
        errors = errors + "\n" + "Customer Not Selected";
        cmbCustomer.style.border = invalid;
    }
    else addvalue = 1;

    if (customerreturn.customerReturnItemList.length == 0){
        errors = errors + "\n" + "Items Not Selected";
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }
    else addvalue = 1;

    if (customerreturn.totalamount == null){
        errors = errors + "\n" + "Total Return Value Not Enter";
        txtTotalaount.style.border = invalid;
    }
    else addvalue = 1;

    return errors;

}

function btnAddMC() {

    if (getErrors() == "") {
        if (txtDescription.value == "") {
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
    // Get Next Number Form Data Base
    var nextNumber = httpRequest("/customerreturn/nextnumber", "GET");
    txtReturnno.value = nextNumber.returnno;
    customerreturn.returnno = txtReturnno.value;
    txtReturnno.style.border = valid;

    swal({
        title: "Are you sure to add following Customer Return...?",
        text: "\nCustomer Order Number : " + customerreturn.returnno +
            "\nCustomer : " + customerreturn.customerId.cname +
            "\nTotal Return Value : " + customerreturn.totalamount +
            "\nReturn Status  : " + customerreturn.customerreturnstatusId.name +
            "\nOrder Date : " + customerreturn.date +
            "\nOrdered By : " + customerreturn.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,

    }).then((willAdd) => {
        if(willAdd) {
            var response = httpRequest("/customerreturn", "POST", customerreturn);
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

function btnClearMC() {
    //Get Cofirmation from the User window.confirm();
    checkerr = getErrors();

    if (oldcustomerreturn == null && addvalue == "") {
        loadForm();
        selectDeleteRow();
    } else {
        swal({
            title: "Form has some values, updates values... Are you sure to discard the form ?",
            text: "\n",
            icon: "warning",
            buttons: true,
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

    if(oldcustomerreturn==null){
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


function fillForm(cusr, rowno) {
    activerowno = rowno;

    clearSelection(tblCreturn);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblCreturn,activerowno,active);

    customerreturn = JSON.parse(JSON.stringify(cusr));
    oldcustomerreturn = JSON.parse(JSON.stringify(cusr));

    cmbReturnstatus.removeAttribute("disabled", "disabled");
    cmbItem.disabled = false;
    spnReturnno.style.visibility="visible";

    txtReturnno.value = customerreturn.returnno;
    txtTotalaount.value = customerreturn.totalamount;
    txtDescription.value = customerreturn.description;
    dteDOCreated.value = customerreturn.date;

    fillCombo3(cmbCustomer,"",customers,"regno","cname",customerreturn.customerId.cname);
    $('.select2-container').css('border', '3px solid green');

    fillCombo(cmbReturnstatus , "", customerreturnstatuses, "name", customerreturn.customerreturnstatusId.name);
    fillCombo(cmbEmployeeCreated, "", employeecreated, "callingname", customerreturn.employeeId.callingname);

    refreshInnerForm();
    if(customerreturn.customerReturnItemList.length != null){
        itemFlied.style.border = valid;
        itemFliedLegend.style.border = valid;
    }else {
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }


    setStyle(valid);

    if (customerreturn.description == null) {
        fldDescription.style.border = initial;
    }
}


function getUpdates() {

    var updates = "";

    if (customerreturn != null && oldcustomerreturn != null) {
        if (customerreturn.customerId.cname != oldcustomerreturn.customerId.cname)
            updates = updates + "\nCustomer Name is Changed";

        if (customerreturn.totalamount != oldcustomerreturn.totalamount)
            updates = updates + "\nTotal Return Value is Changed";

        if (customerreturn.description != oldcustomerreturn.description)
            updates = updates + "\nDescription is Changed";

        if (customerreturn.customerreturnstatusId.name != oldcustomerreturn.customerreturnstatusId.name)
            updates = updates + "\nReturn Status is Changed";

        if (isEqual(customerreturn.customerReturnItemList, oldcustomerreturn.customerReturnItemList, "itemId"))
            updates = updates + "\nItems are Changed";
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
                title: "Are you sure to update following Customer Return details...?",
                text: "\n" + getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if(willUpdate) {
                    var response = httpRequest("/customerreturn", "PUT", customerreturn);
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

function btnDeleteMC(cusr) {
    customerreturn = JSON.parse(JSON.stringify(cusr));

    swal({
        title: "Are you sure to delete following Customer Return...?",
        text: "\nCustomer Order Number : " + customerreturn.returnno +
            "\nCustomer : " + customerreturn.customerId.cname +
            "\nTotal Return Value : " + customerreturn.totalamount +
            "\nReturn Status  : " + customerreturn.customerreturnstatusId.name +
            "\nOrder Date : " + customerreturn.date +
            "\nOrdered By : " + customerreturn.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if(willDelete) {
            var responce = httpRequest("/customerreturn", "DELETE", customerreturn);
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
)
    ;

}

function loadSearchedTable() {

    var searchtext = txtSearchname.value;

    var query = "&searchtext=";

    if (searchtext != "")
        query = "&searchtext=" + searchtext;
    //window.alert(query);
    loadTable(activepage, cmbPagesize.value, query);

}

function btnSearchMC() {
    activepage = 1;
    loadSearchedTable();
}

function btnSearchClearMC(){
    loadView();
}

function btnPrintTableMC(customerreturn) {

    var newwindow = window.open();
    formattab = tblCreturn.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Customer Return Details : </h1></div>" +
        "<div>" + formattab + "</div>" +
        "</body>" +
        "</html>");
    setTimeout(function () {
        newwindow.print();
        newwindow.close();
    }, 100);
}

function sortTable(crind) {
    cindex = crind;

    var crprop = tblCreturn.firstChild.firstChild.children[cindex].getAttribute('property');

    if (crprop.indexOf('.') == -1) {
        customerreturns.sort(
            function (a, b) {
                if (a[crprop] < b[crprop]) {
                    return -1;
                } else if (a[crprop] > b[crprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    } else {
        customerreturns.sort(
            function (a, b) {
                if (a[crprop.substring(0, crprop.indexOf('.'))][crprop.substr(crprop.indexOf('.') + 1)] < b[crprop.substring(0, crprop.indexOf('.'))][crprop.substr(crprop.indexOf('.') + 1)]) {
                    return -1;
                } else if (a[crprop.substring(0, crprop.indexOf('.'))][crprop.substr(crprop.indexOf('.') + 1)] > b[crprop.substring(0, crprop.indexOf('.'))][crprop.substr(crprop.indexOf('.') + 1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblCreturn', customerreturns, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblCreturn);
    selectDeleteRow();

    if (activerowno != "") selectRow(tblCreturn, activerowno, active);

}


