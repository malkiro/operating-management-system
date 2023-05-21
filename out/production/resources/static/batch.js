window.addEventListener("load", initialize);

//Initializing Functions
function initialize() {

    txtSearchname.addEventListener("keyup",btnSearchMC);
    txtBatchqty.addEventListener("keyup",txtBatchqtyKU);
    txtAvalableqty.addEventListener("keyup",txtAvalableqtyKU);
    txtReturnqty.addEventListener("keyup",txtReturnqtyKU);

    privilages = httpRequest("../privilage?module=BATCH","GET");

    // //Data services for Combo Boxes
    items = httpRequest("../item/list","GET");
    suppliers = httpRequest("../supplier/list","GET");


    valid = "3px solid green";
    invalid = "3px solid red";
    initial = "3px solid #d6d6c2";
    updated = "3px solid #ff9900";
    active = "#ff9900";

    loadForm();
    loadView();

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
    batchs = new Array();
    var data = httpRequest("/batch/findAll?page="+page+"&size="+size+query,"GET");
    if(data.content!= undefined) batchs = data.content;
    createPagination('pagination',data.totalPages, data.number+1,paginate);
    fillTable('tblBatch',batchs,fillForm,null,viewitem);
    clearSelection(tblBatch);

    if(activerowno!="")selectRow(tblBatch,activerowno,active);

    if(batch != 0){
        for(var i =0; i< tblBatch.children[1].children.length; i++){
            tblBatch.children[1].children[i].lastChild.style.paddingLeft = "40px";
            tblBatch.children[1].children[i].lastChild.children[2].style.marginLeft = "10px";
            tblBatch.children[1].children[i].lastChild.children[1].style.display = "none";
        }
    }
}


function paginate(page) {
    var paginate;
    if(oldbatch==null){
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
        activerowno=""
        loadSearchedTable();
        loadForm();
    }

}

function viewitem(btch,rowno) {

    batch = JSON.parse(JSON.stringify(btch));

    tbBatchcode.innerHTML = batch.batchcode;
    tbItem.innerHTML = batch.itemId.itemname;
    tbSupplier.innerHTML = batch.supplierId.sname;
    tbMnfdate.innerHTML = batch.mnfdate;
    tbExpdate.innerHTML = batch.expdate;
    tbPprice.innerHTML = toDecimal(batch.purchaseprice,2);
    tbMprice.innerHTML = toDecimal(batch.marketprice,2);
    tbSprice.innerHTML = toDecimal(batch.salesprice,2);
    tbBatchqty.innerHTML = batch.batchqty;
    tbAvalableqty.innerHTML = batch.avalableqty;
    tbReturnqty.innerHTML = batch.returnqty;

}


function printMC() {
    var format = printformtable.outerHTML;

    var printwindow = window.open();
    printwindow.document.write("<html><head>" +
        " <link rel='stylesheet' href='resourse/bootstrap/css/bootstrap.min.css'>" +
        "</head></body>" +
        "<div style='margin-top: 100px'><h1>Item Batch Details</h1></div>" +
        "<div>" + format + "</div>" +
        "</body></html>"
    );
    setTimeout(function () { printwindow.print(); }, 100);
}

 function loadForm() {
     batch = new Object();
     oldbatch = null;

     fillCombo(cmbSupplier, "Select Supplier", suppliers, "sname");
     fillCombo(cmbItem, "Select Item", items, "itemname");

     $("#chkClose").prop("checked", false);

     txtBatchcode.value = "";
     txtMnfdate.value = "";
     txtExpdate.value = "";
     txtPprice.value = "";
     txtSprice.value = "";
     txtMprice.value = "";
     txtBatchqty.value = "";
     txtAvalableqty.value = "";
     txtReturnqty.value = "";

     setStyle(initial);
 }

function setStyle(style) {
    txtBatchcode.style.border = style;
    cmbItem.style.border = style;
    cmbSupplier.style.border = style;
    txtMnfdate.style.border = style;
    txtExpdate.style.border = style;
    txtPprice.style.border = style;
    txtMprice.style.border = style;
    txtSprice.style.border = style;
    txtBatchqty.style.border = style;
    txtAvalableqty.style.border = style;
    txtReturnqty.style.border = style;
}

function txtBatchqtyKU() {

}

function txtAvalableqtyKU() {

}

function txtReturnqtyKU() {

}

function getErrors() {

    var errors = "";
    addvalue = "";

    if (batch.batchcode == null){
        errors = errors + "\n" + "Batch Code Not Enter";
        txtBatchcode.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.itemId == null){
        errors = errors + "\n" + "Item Name Not Selected";
        cmbItem.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.supplierId == null){
        errors = errors + "\n" + "Supplier Not Selected";
        cmbSupplier.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.mnfdate == null){
        errors = errors + "\n" + "Manufacture Date Not Enter";
        txtMnfdate.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.expdate == null){
        errors = errors + "\n" + "Expire Date Not Enter";
        txtExpdate.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.purchaseprice == null){
        errors = errors + "\n" + "Purchase Price Not Enter";
        txtPprice.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.marketprice == null){
        errors = errors + "\n" + "Market Price Not Enter";
        txtMprice.style.border = invalid;
    }

    else  addvalue = 1;

    if (batch.salesprice == null){
        errors = errors + "\n" + "Sale Price Not Enter";
        txtSprice.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.batchqty == null){
        errors = errors + "\n" + "Total Batch Quantity Not Enter";
        txtBatchqty.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.avalableqty == null){
        errors = errors + "\n" + "Avalable Quantity Not Enter";
        txtAvalableqty.style.border = invalid;
    }
    else  addvalue = 1;

    if (batch.returnqty == null){
        errors = errors + "\n" + "Return Quantity Not Enter";
        txtReturnqty.style.border = invalid;
    }

    return errors;

}

function fillForm(bch,rowno){
    activerowno = rowno;

    clearSelection(tblBatch);
    selectRow(tblBatch,activerowno,active);

    batch = JSON.parse(JSON.stringify(bch));
    oldbatch = JSON.parse(JSON.stringify(bch));

    txtBatchcode.value = batch.batchcode;
    txtMnfdate.value = batch.mnfdate;
    txtExpdate.value = batch.expdate;
    txtPprice.value = parseFloat(batch.purchaseprice).toFixed(2);
    txtMprice.value = parseFloat(batch.marketprice).toFixed(2);
    txtSprice.value = parseFloat(batch.salesprice).toFixed(2);
    txtBatchqty.value = batch.batchqty;
    txtAvalableqty.value = batch.avalableqty;
    txtReturnqty.value = batch.returnqty;

    fillCombo(cmbItem, "", items, "itemname",batch.itemId.itemname);
    fillCombo(cmbSupplier, "", suppliers, "sname",batch.supplierId.sname);

    setStyle(valid);
}

function getUpdates() {

    var updates = "";

    if(batch!=null && oldbatch!=null) {

        if (batch.batchcode != oldbatch.batchcode)
            updates = updates + "\nBatch Code is Changed";

        if (batch.itemId.itemname != oldbatch.itemId.itemname)
            updates = updates + "\nItem Name is Changed";

        if (batch.supplierId.sname != oldbatch.supplierId.sname)
            updates = updates + "\nSupplier is Changed";

        if (batch.mnfdate != oldbatch.mnfdate)
            updates = updates + "\nManufacture Date is Changed";

        if (batch.expdate != oldbatch.expdate)
            updates = updates + "\nExpire Date is Changed";

        if (batch.purchaseprice != oldbatch.purchaseprice)
            updates = updates + "\nPurchase Price  is Changed";

        if (batch.marketprice != oldbatch.marketprice)
            updates = updates + "\nMarket Price is Changed";

        if (batch.salesprice != oldbatch.salesprice)
            updates = updates + "\nSale Price is Changed";

        if (batch.batchqty != oldbatch.batchqty)
            updates = updates + "\nTotal Batch Quantity is Changed";

        if (batch.avalableqty != oldbatch.avalableqty)
            updates = updates + "\nAvalable Quantity is Changed";

        if (batch.returnqty != oldbatch.returnqty)
            updates = updates + "\nReturn Quantity is Changed";

        if (batch.addeddate != oldbatch.addeddate)
            updates = updates + "\nAdded Date is Changed";
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
                title: "Are you sure to update following Batch details...?",
                text: "\n"+ getUpdates(),
                icon: "warning",
                buttons: true,
                dangerMode: true,
                closeOnClickOutside: false,
            })
                .then((willUpdate) => {
                if (willUpdate) {
                    var response = httpRequest("/batch", "PUT", batch);
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
                        closeOnClickOutside: false
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
            closeOnClickOutside: false
        });
}

// function btnDeleteMC(bch) {
//     batch = JSON.parse(JSON.stringify(bch));
//
//     swal({
//         title: "Are you sure to delete following Batch...?",
//         text :  "\nBatch Code : " + batch.batchcode +
//             "\nItem Name : " + batch.itemId.itemname +
//             "\nSupplier Name : " + batch.supplierId.sname +
//             "\nManufacture Date  : " + batch.mnfdate +
//             "\nExpire Date  : " + batch.expdate +
//             "\nPurchase Price  : " + batch.purchaseprice +
//             "\nMarket Price : " + batch.marketprice +
//             "\nSale Price  : " + batch.salesprice +
//             "\nTotal Batch Quantity : " + batch.batchqty +
//             "\nAvalable Quantity : " + batch.avalableqty +
//             "\nReturn Quantity : " + batch.returnqty ,
//         icon: "warning",
//         buttons: true,
//         dangerMode: true,
//         closeOnClickOutside: false,
//     }).then((willDelete)=> {
//         if (willDelete) {
//             var responce = httpRequest("/batch","DELETE",batch);
//             if (responce==0) {
//                 swal({
//                     title: "Deleted Successfully....!",
//                     text: "\n\n  Status change to delete",
//                     icon: "success",
//                     button: false,
//                     timer: 1200,
//                 });
//                 loadForm();
//                 loadSearchedTable();
//             } else {
//                 swal({
//                     title: "You have following erros....!",
//                     text: "\n\n" + responce,
//                     icon: "error",
//                     button: true,
//                     closeOnClickOutside: false,
//                 });
//             }
//         }
//     });
//
// }

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

function btnPrintTableMC(batch) {

    var newwindow=window.open();
    formattab = tblBatch.outerHTML;

    newwindow.document.write("" +
        "<html>" +
        "<head><style type='text/css'>.google-visualization-table-th {text-align: left;} .modifybutton{display: none} .isort{display: none}</style>" +
        "<link rel='stylesheet' href='../plugin/bootstrap/css/bootstrap.min.css'/></head>" +
        "<body><div style='margin-top: 150px; '> <h1>Item Batch Details : </h1></div>" +
        "<div>"+ formattab+"</div>"+
        "</body>" +
        "</html>");
    setTimeout(function () {newwindow.print(); newwindow.close();},100) ;
}

function sortTable(bchind) {
    cindex = bchind;

    var bchprop = tblBatch.firstChild.firstChild.children[cindex].getAttribute('property');

    if(bchprop.indexOf('.') == -1) {
        batchs.sort(
            function (a, b) {
                if (a[bchprop] < b[bchprop]) {
                    return -1;
                } else if (a[bchprop] > b[bchprop]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }else {
        batchs.sort(
            function (a, b) {
                if (a[bchprop.substring(0,bchprop.indexOf('.'))][bchprop.substr(bchprop.indexOf('.')+1)] < b[bchprop.substring(0,bchprop.indexOf('.'))][bchprop.substr(bchprop.indexOf('.')+1)]) {
                    return -1;
                } else if (a[bchprop.substring(0,bchprop.indexOf('.'))][bchprop.substr(bchprop.indexOf('.')+1)] > b[bchprop.substring(0,bchprop.indexOf('.'))][bchprop.substr(bchprop.indexOf('.')+1)]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }
    fillTable('tblBatch',batchs,fillForm,null,viewitem);
    clearSelection(tblBatch);

    if(activerowno!="")selectRow(tblBatch,activerowno,active);

}

