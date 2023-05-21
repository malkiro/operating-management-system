window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    // $(".js-example-placeholder-single").select2({
    //     placeholder: "Select an Item",
    //     allowClear: true
    // });

    $(document).ready(function() {
        $('.js-example-basic-single').select2();
    });

    // $('.js-example-basic-single').select2();


    txtSearchname.addEventListener("keyup", btnSearchMC);
    txtQty.addEventListener("keyup", txtQtyMC);
    cmbItem.addEventListener("change", cmbItemCH);
    cmbCustomer.addEventListener("change", cmbCustomerMC);

    privilages = httpRequest("../privilage?module=CORDER", "GET");

    //Data services for Combo Boxes
    distributionroutes = httpRequest("../distributionroute/list","GET");
    activedistributionroutes = httpRequest("../distributionroute/activelist","GET");
    // customers = httpRequest("../customer/list", "GET");
    // activecustomers = httpRequest("../customer/activelist", "GET");
    customers = httpRequest("../customer/invoiceList", "GET");
    activecustomers = httpRequest("../customer/activeinvoicelist", "GET");
    corderstatuses = httpRequest("../corderstatus/list", "GET");
    employeeordered = httpRequest("../employee/list", "GET");
    items = httpRequest("../item/list", "GET");
    customerpoints = httpRequest("../customerpoint/list", "GET");

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
    corders = new Array();
    var data = httpRequest("/corder/findAll?page=" + page + "&size=" + size + query, "GET");
    if (data.content != undefined) corders = data.content;
    createPagination('pagination', data.totalPages, data.number + 1, paginate);

    fillTable('tblCorder', corders, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblCorder);
    selectDeleteRow();

    if (activerowno != "") selectRow(tblCorder, activerowno, active);

}

function selectDeleteRow() {

    for (index in corders) {
        if (corders[index].corderstatusId.name == "Deleted") {
            tblCorder.children[1].children[index].style.color = "#f00";
            tblCorder.children[1].children[index].style.fontWeight = "bold";
            tblCorder.children[1].children[index].lastChild.children[1].disabled = true;
            tblCorder.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }

        if (corders[index].corderstatusId.name == "Pending" || corders[index].corderstatusId.name =="In-Delivery"
            || corders[index].corderstatusId.name =="Delivered" || corders[index].corderstatusId.name =="Completed") {
            tblCorder.children[1].children[index].lastChild.children[0].disabled = true;
            tblCorder.children[1].children[index].lastChild.children[0].style.cursor = "not-allowed";
            tblCorder.children[1].children[index].lastChild.children[1].disabled = true;
            tblCorder.children[1].children[index].lastChild.children[1].style.cursor = "not-allowed";
        }
    }
}

function paginate(page) {
    var paginate;
    if (oldcorder == null) {
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

function viewitem(cor, rowno) {

    corder = JSON.parse(JSON.stringify(cor));

    tbCordernumber.innerHTML = corder.cono;
    // tbRoute.innerHTML = corder.customerId.distributionrouteId.routename;
    tbCustomer.innerHTML = corder.customerId.cname;
    fillInnerTable("tblPrintInnerItem", corder.corderItemList, mdifyInnerForm, deleteInnerForm);
    tbGrandtotal.innerHTML = toDecimal(corder.grandtotal,2);
    tbDiscount.innerHTML = corder.discountedratio+"%";
    tbNettotal.innerHTML = toDecimal(corder.nettotal,2);
    tbRequireddate.innerHTML = corder.requiredate;
    tbDescription.innerHTML = corder.description;
    tbOrderdate.innerHTML = corder.date;
    tbCorderstatus.innerHTML = corder.corderstatusId.name;
    tbEmployeeOrdered.innerHTML = corder.employeeId.callingname;

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Customer Order Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () {
        printwindow.print();
    }, 100);
}


function loadForm() {
    corder = new Object();
    oldcorder = null;

    corder.corderItemList = new Array();

    // fillCombo(cmbRoute, "Select Distribute Route", activedistributionroutes, "routename");
    // fillCombo(cmbCustomer, "Select Customer", activecustomers, "cname");

    fillCombo3(cmbCustomer,"Select Customer",activecustomers,"regno","cname","");
    $('.select2-container').css('border', '3px solid #d6d6c2');

    fillCombo(cmbCorderstatus, "", corderstatuses, "name", "Ordered");
    corder.corderstatusId = JSON.parse(cmbCorderstatus.value);

    fillCombo(cmbEmployeeOrdered, "", employeeordered, "callingname",session.getObject('activeuser').employeeId.callingname);
    corder.employeeId = JSON.parse(cmbEmployeeOrdered.value);
    cmbEmployeeOrdered.disabled = "disabled";

    var today = new Date();
    var month = today.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = today.getDate();
    if (date < 10) date = "0" + date;

    dteOrderdate.value = today.getFullYear() + "-" + month + "-" + date;
    corder.date = dteOrderdate.value;
    dteOrderdate.disabled = "disabled";

    //set min and max date
    var twoweekafterday = new Date();
    twoweekafterday.setDate(today.getDate()+14);
    dteRequireddate.min = today.getFullYear() + "-" + month + "-" + date;
    dteRequireddate.max = twoweekafterday.getFullYear()+"-"+getmonthdate(twoweekafterday);



    cmbCorderstatus.setAttribute("disabled", "disabled");
    cmbItem.disabled = true;
    spnCordernumber.style.visibility="hidden";
    $("#chkClose").prop("checked", false);

    txtCordernumber.value = "";
    txtCordernumber.disabled = "disabled";
    txtGrandtotal.value = "";
    txtGrandtotal.disabled = false;
    txtDiscount.value = "";
    txtDiscount.disabled = false;
    txtNettotal.value = "";
    txtNettotal.disabled = false;
    dteRequireddate.value = "";
    txtDescription.value = "";

    setStyle(initial);
    txtCordernumber.style.border = initial;
    cmbCorderstatus.style.border = valid;
    dteOrderdate.style.border = valid;
    cmbEmployeeOrdered.style.border = valid;
    itemFlied.style.border = initial;
    itemFliedLegend.style.border = initial;

    disableButtons(false, true, true);
    refreshInnerForm();

}

function refreshInnerForm() {

    total = 0.00;

    corderitem = new Object();
    oldcorderitem = null;

    fillCombo(cmbItem,"Select Item",items,"itemname","");
    $('.select2-container').css('border', '3px solid #d6d6c2');

    txtQty.value = "";
    txtQty.style.border = initial;

    txtMprice.value = "";
    txtMprice.style.border = initial;
    txtMprice.disabled = false;

    txtLinetotal.value = "";
    txtLinetotal.style.border = initial;
    txtLinetotal.disabled = false;

    fillInnerTable("tblInnerItem", corder.corderItemList, mdifyInnerForm, deleteInnerForm);

    if (corder.corderItemList.length != 0) {
        for (index in corder.corderItemList) {
            total = parseFloat(total) + parseFloat(corder.corderItemList[index].linetotal);
        }

        txtGrandtotal.value = toDecimal(total,2);
        txtGrandtotal.style.border = valid;
        txtGrandtotal.disabled = true;
        corder.grandtotal = txtGrandtotal.value;
    } else {
        txtGrandtotal.value = "";
        corder.totalprice = null;
    }


    generateDiscontRatio();

    if(txtGrandtotal.value != "") {
        txtNettotal.value = (parseFloat(txtGrandtotal.value) - (parseFloat(txtGrandtotal.value) * parseFloat(corder.discountedratio) / 100)).toFixed(2);
        corder.nettotal = txtNettotal.value;
        txtNettotal.style.border = valid;
        txtNettotal.disabled = true;
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

    if (txtQty.value == ""){
        txtQty.style.border = invalid;
        errors = errors + "\n" + "Quantity Not Enter";
    }
    else  addvalue = 1;

    return errors;
}

function btnInnerAddMC() {
    if(innergetErrors()==""){
            corderitem.qty = txtQty.value;
            corderitem.mprice = toDecimal(txtMprice.value,2);

            corderitem.linetotal = toDecimal(parseFloat(txtMprice.value) * parseFloat(txtQty.value),2);
            corderitem.itemId = JSON.parse(cmbItem.value);

            itemexs = false;
            for (index in corder.corderItemList) {
                if (corder.corderItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname) {
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
                //credit limit check
                var creditapprove = true;
                var itemtotal = 0.00;
                var creditlimitgap = parseFloat(JSON.parse(cmbCustomer.value).maxcreditlimt) - parseFloat(JSON.parse(cmbCustomer.value).tobepaid);
                    if (corder.corderItemList.length != 0) {
                        for (index in corder.corderItemList) {
                            itemtotal = parseFloat(itemtotal) + parseFloat(corder.corderItemList[index].linetotal);
                        }
                        itemtotal = parseFloat(itemtotal) + parseFloat(corderitem.linetotal);

                        if (itemtotal>creditlimitgap){
                            creditapprove =false;
                        }

                    }else{
                        if (parseFloat(corderitem.linetotal)>creditlimitgap){
                            creditapprove =false;
                        }
                    }

            }


            if(creditapprove){
                corder.corderItemList.push(corderitem);
                refreshInnerForm();
            }else{
                swal({
                    title: "Credit Limit Allready has been Exceeded",
                    text: "\n",
                    icon: "warning",
                    button: true,
                });
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

function getInnerUpdate(corderitem) {
    var updates = "";

    if (corderitem.itemId.itemname != JSON.parse(cmbItem.value).itemname)
        updates = updates + "\nItems are Changed";

    if (corderitem.qty != txtQty.value)
        updates = updates + "\nQuantity is Changed";

    if (corderitem.mprice != txtMprice.value)
        updates = updates + "\nMarket Price is Changed";

    if (corderitem.linetotal != txtLinetotal.value)
        updates = updates + "\nLine Total is Changed";


    return updates;
}

function btnInnerUpdateMC() {
    var errors = innergetErrors();
    if (errors == "") {
        innerUpdates = getInnerUpdate(corder.corderItemList[selectedInnerRow]);
        if (innerUpdates == ""){
            swal({
                title: "Nothing Updated",
                text: "\n",
                icon: "warning",
                timer: 1200,
            })
        }
        else {
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
                    for (index in corder.corderItemList) {
                        if (corder.corderItemList[index].itemId.itemname == JSON.parse(cmbItem.value).itemname) {
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
                        corder.corderItemList[selectedInnerRow].itemId = JSON.parse(cmbItem.value);
                        corder.corderItemList[selectedInnerRow].qty = txtQty.value;
                        corder.corderItemList[selectedInnerRow].mprice = txtMprice.value;
                        corder.corderItemList[selectedInnerRow].linetotal = txtLinetotal.value;
                        refreshInnerForm();

                        if (isEqual(corder.corderItemList, oldcorder.corderItemList, "itemId")){
                            itemFlied.style.border = updated;
                            itemFliedLegend.style.border = updated;
                        }else {
                            itemFlied.style.border = valid;
                            itemFliedLegend.style.border = valid;
                        }

                        if (corder.grandtotal != oldcorder.grandtotal){
                            txtGrandtotal.style.border = updated;
                        }

                        if (corder.discountedratio != oldcorder.discountedratio){
                            txtDiscount.style.border = updated;
                        }

                        if (corder.nettotal != oldcorder.nettotal){
                            txtNettotal.style.border = updated;
                        }
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

function mdifyInnerForm(corderitem, indx) {

    selectedInnerRow = indx;
    fillCombo(cmbItem,"Select Item",items,"itemname",corderitem.itemId.itemname);
    $('.select2-container').css('border', '3px solid green');

    txtMprice.value = toDecimal(corderitem.mprice,2);
    txtMprice.style.border = valid;
    txtMprice.disabled=true;

    txtQty.value = corderitem.qty;
    txtQty.style.border = valid;

    txtLinetotal.value = toDecimal(corderitem.linetotal);
    txtLinetotal.style.border = valid;
    txtLinetotal.disabled=true;

    btnInnerUpdate.removeAttribute("disabled", "disabled");
    $('#btnInnerUpdate').css('cursor','pointer');

    btnInnerAdd.setAttribute("disabled", "disabled");
    $('#btnInnerAdd').css('cursor','not-allowed');
}

function deleteInnerForm(corderitem, index) {

    swal({
        title: "Do you want to remove Item",
        text: "\n",
        icon: "warning",
        buttons: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if(willDelete) {
            corder.corderItemList.splice(index, 1);
            refreshInnerForm();
            if(corder.corderItemList.length == 0){
                itemFlied.style.border = invalid;
                itemFliedLegend.style.border = invalid;
            }
        }

    }
);

}

function setStyle(style) {

    txtCordernumber.style.border = style;
    // cmbRoute.style.border = style;
    cmbCustomer.style.border = style;
    txtGrandtotal.style.border = style;
    txtDiscount.style.border = style;
    txtNettotal.style.border = style;
    dteRequireddate.style.border = style;
    txtDescription.style.border = style;
    dteOrderdate.style.border = style;
    cmbCorderstatus.style.border = style;
    cmbEmployeeOrdered.style.border = style;
    cmbCustomer.children[1].style.border = valid;

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

// function cmbRouteMC() {
//     //get customer list by given route
//     customers = httpRequest("../customer/listbyroute?distributionrouteid="+JSON.parse(cmbRoute.value).id,"GET");
//     fillCombo(cmbCustomer, "Select Customer", customers, "cname");
//     cmbCustomer.removeAttribute("disabled", "disabled");
//     cmbCustomer.style.border = initial;
//     cmbRoute.style.border = valid;
//
//     if(oldcorder != null && oldcorder.customerId.distributionrouteId.id !=JSON.parse(cmbRoute.value).id ){
//         cmbRoute.style.border = updated;
//     }else {
//         cmbRoute.style.border=valid;
//     }
// }

function cmbCustomerMC() {
    cmbItem.disabled = false;
}



function txtQtyMC() {
    txtLinetotal.value = toDecimal(parseFloat(txtMprice.value) * parseFloat(txtQty.value),2);
    txtLinetotal.style.border = valid;
    txtLinetotal.disabled = true;
}

function cmbItemCH() {
    itembatch = httpRequest("/batch/byitem?itemid="+JSON.parse(cmbItem.value).id,"GET");

    txtMprice.value = parseFloat(itembatch.marketprice).toFixed(2);
    txtMprice.style.border = valid;
    txtMprice.disabled = true;
    corderitem.mprice =  txtMprice.value;

    //To Change lineTotal
    if(txtQty.value!="") {
        txtLinetotal .value = toDecimal(parseFloat(txtMprice.value) * parseFloat(txtQty.value), 2);
        txtLinetotal .style.border = valid;
        txtLinetotal .setAttribute("disabled", "disabled");
    }
}

function getErrors() {
    var errors = "";
    addvalue = "";

    if (corder.customerId == null){
        errors = errors + "\n" + "Customer Not Selected";
        cmbCustomer.style.border = invalid;
    }
    else addvalue = 1;

    if (corder.corderItemList.length == 0){
        errors = errors + "\n" + "Items Not Selected";
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }
    else addvalue = 1;

    if (corder.grandtotal == null){
        errors = errors + "\n" + "Grand Total Not Enter";
        txtGrandtotal.style.border = invalid;
    }
    else addvalue = 1;

    if (corder.discountedratio == null){
        errors = errors + "\n" + "Discounted Ratio Not Enter";
        txtDiscount.style.border = invalid;
    }
    else addvalue = 1;

    if (corder.nettotal == null){
        errors = errors + "\n" + "Net Total Not Enter";
        txtNettotal.style.border = invalid;
    }
    else addvalue = 1;

    return errors;

}

function btnAddMC() {
    if (getErrors() == "") {
        if (txtDescription.value == "" || dteRequireddate.value == "") {
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
    // // Get Next Number Form Data Base
    var nextNumber = httpRequest("/corder/nextnumber", "GET");
    txtCordernumber.value = nextNumber.cono;
    corder.cono = txtCordernumber.value;
    txtCordernumber.style.border = valid;

    swal({
        title: "Are you sure to add following Customer Order...?",
        text: "\nCustomer Order Number : " + corder.cono +
            // "\nRoute : " + corder.customerId.distributionrouteId.routename +
            "\nCustomer : " + corder.customerId.cname +
            "\nGrand Total : " + corder.grandtotal +
            "\nDiscounted Ratio : " + corder.discountedratio +
            "\nNet Total : " + corder.nettotal +
            "\nOrder Status  : " + corder.corderstatusId.name +
            "\nOrder Date : " + corder.date +
            "\nOrdered By : " + corder.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,

    }).then((willAdd) => {
        if(willAdd) {
            var response = httpRequest("/corder", "POST", corder);
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

    if (oldcorder == null && addvalue == "") {
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
    )
        ;

    }
}

function btnCloseMC(){
    checkerror = getErrors();

    if(oldcorder==null){
        if(addvalue=="1"){
            swal({
                title: "Form has Some Values, \n Are you sure to discard that changes ? ",
                icon: "warning",
                buttons: [true, " Yes ! Discard"],
                dangerMode: true,
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


function fillForm(cor, rowno) {
    activerowno = rowno;

    clearSelection(tblCorder);
    disableButtons(true, false, false);
    selectDeleteRow();
    selectRow(tblCorder,activerowno,active);

    corder = JSON.parse(JSON.stringify(cor));
    oldcorder = JSON.parse(JSON.stringify(cor));

    cmbCorderstatus.removeAttribute("disabled", "disabled");
    cmbItem.disabled = false;
    spnCordernumber.style.visibility="visible";

    txtCordernumber.value = corder.cono;
    txtGrandtotal.value = corder.grandtotal;
    txtDiscount.value = corder.discountedratio;
    txtDiscount.disabled = true;
    txtNettotal.value = corder.nettotal;
    dteRequireddate.value = corder.requiredate;
    txtDescription.value = corder.description;
    dteOrderdate.value = corder.date;


    fillCombo3(cmbCustomer,"",activecustomers,"regno","cname",corder.customerId.cname);
    // cmbCustomer.children[1].style.border = valid;
    $('.select2-container').css('border', '3px solid green');

    fillCombo(cmbCorderstatus , "", corderstatuses, "name", corder.corderstatusId.name);
    fillCombo(cmbEmployeeOrdered, "", employeeordered, "callingname", corder.employeeId.callingname);

    refreshInnerForm();

    setStyle(valid);

    // if (corder.customerId.distributionrouteId != null) {
    //     fillCombo(cmbRoute, "Select Distribute Route", distributionroutes, "routename",corder.customerId.distributionrouteId.routename);
    //     cmbRoute.style.border = valid;
    //     customers = httpRequest("../customer/listbyroute?distributionrouteid="+JSON.parse(cmbRoute.value).id,"GET");
    //     fillCombo(cmbCustomer, "", customers, "cname", corder.customerId.cname);
    //     cmbCustomer.style.border = valid;
    // }else {
    //     fillCombo(cmbRoute, "Select Distribute Route", distributionroutes, "routename");
    //     cmbRoute.style.border = initial;
    //     fillCombo(cmbCustomer, "", customers, "cname", corder.customerId.cname);
    //     cmbCustomer.style.border = valid;
    // }


    if(corder.corderItemList.length != null){
        itemFlied.style.border = valid;
        itemFliedLegend.style.border = valid;
    }else {
        itemFlied.style.border = invalid;
        itemFliedLegend.style.border = invalid;
    }

    if (corder.description == null) {
        txtDescription.style.border = initial;
    }

    if (corder.requiredate == null) {
        dteRequireddate.style.border = initial;
    }
}


function getUpdates() {

    var updates = "";

    if (corder != null && oldcorder != null) {
        // if (oldcorder.customerId.distributionrouteId.id !=JSON.parse(cmbRoute.value).id)
        //     updates = updates + "\nRoute is Changed";

        if (corder.customerId.cname != oldcorder.customerId.cname)
            updates = updates + "\nCustomer Name is Changed";

        if (isEqual(corder.corderItemList, oldcorder.corderItemList, "itemId"))
            updates = updates + "\nItems are Changed";

        if (corder.grandtotal != oldcorder.grandtotal)
            updates = updates + "\nGrand Total is Changed";

        if (corder.discountedratio != oldcorder.discountedratio)
            updates = updates + "\nDiscounted Ratio is Changed";

        if (corder.nettotal != oldcorder.nettotal)
            updates = updates + "\nNet Total is Changed";

        if (corder.requiredate != oldcorder.requiredate)
            updates = updates + "\nRequired Date is Changed";

        if (corder.description != oldcorder.description)
            updates = updates + "\nDescription is Changed";

        if (corder.corderstatusId.name != oldcorder.corderstatusId.name)
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
                title: 'Nothing Updated..!', icon: "warning",
                text: '\n',
                button: false,
                timer: 1200
            });
        else {
            swal({
                title: "Are you sure to update following Customer Order details...?",
                text: "\n" + getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if(willUpdate) {
                    var response = httpRequest("/corder", "PUT", corder);
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

function btnDeleteMC(cor) {
    corder = JSON.parse(JSON.stringify(cor));

    swal({
        title: "Are you sure to delete following Customer Order...?",
        text: "\nCustomer Order Number : " + corder.cono +
            // "\nRoute : " + corder.customerId.distributionrouteId.routename +
            "\nCustomer : " + corder.customerId.cname +
            "\nGrand Total : " + corder.grandtotal +
            "\nDiscounted Ratio : " + corder.discountedratio +
            "\nNet Total : " + corder.nettotal +
            "\nOrder Status  : " + corder.corderstatusId.name +
            "\nOrder Date : " + corder.date +
            "\nOrdered By : " + corder.employeeId.callingname,
        icon: "warning",
        buttons: true,
        dangerMode: true,
        closeOnClickOutside: false,
    }).then((willDelete) => {
        if(willDelete) {
            var responce = httpRequest("/corder", "DELETE", corder);
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

function btnPrintTableMC(corder) {

    var newwindow = window.open();
    formattab = tblCorder.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Customer Order Details : </h1></div>" +
        "<div>" + formattab + "</div>" +
        "</body>" +
        "</html>");
    setTimeout(function () {
        newwindow.print();
        newwindow.close();
    }, 100);
}

function sortTable(coind) {
    cindex = coind;

    var coprop = tblCorder.firstChild.firstChild.children[cindex].getAttribute('property');

    if (coprop.indexOf('.') == -1) {
        corders.sort(
            function (a, b) {
                if (a[coprop] < b[coprop]) {
                    return -1;
                } else if (a[coprop] > b[coprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    } else {
        corders.sort(
            function (a, b) {
                if (a[coprop.substring(0, coprop.indexOf('.'))][coprop.substr(coprop.indexOf('.') + 1)] < b[coprop.substring(0, coprop.indexOf('.'))][coprop.substr(coprop.indexOf('.') + 1)]) {
                    return -1;
                } else if (a[coprop.substring(0, coprop.indexOf('.'))][coprop.substr(coprop.indexOf('.') + 1)] > b[coprop.substring(0, coprop.indexOf('.'))][coprop.substr(coprop.indexOf('.') + 1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblCorder', corders, fillForm, btnDeleteMC, viewitem);
    clearSelection(tblCorder);
    selectDeleteRow();

    if (activerowno != "") selectRow(tblCorder, activerowno, active);


}

function generateDiscontRatio() {
    if(cmbCustomer.value != "") {
        var customer = new Object();
        var customer = JSON.parse(cmbCustomer.value);

        for (var index in customerpoints) {
            if (customerpoints[index].startrate < customer.point && customerpoints[index].endrate >= customer.point) {
                customer.point = parseInt(customer.point) + parseInt(customerpoints[index].pointperinvoice);
                corder.customerId = customer;
                break;
            }
        }
        for (var index in customerpoints) {
            if (parseFloat(txtGrandtotal.value) >= parseFloat(customerpoints[index].invoiceamount)) {
                txtDiscount.value = parseFloat(customerpoints[index].discountratio);
                corder.discountedratio = parseFloat(customerpoints[index].discountratio);
                txtDiscount.style.border = valid;
                txtDiscount.disabled = true;
                break;
            }else {
                txtDiscount.value = 0.00;
                corder.discountedratio = 0.00;
                txtDiscount.style.border = valid;
                txtDiscount.disabled = true;
            }
        }
    }
}


