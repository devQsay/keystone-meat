/* global mask */
/* global unmask */
/* global moment */
/* global BootstrapDialog */
/* global google */
var productionZone = {};

(function () {
  // product properties masks
  const mSOURCE = 0x00000001;
  const mWEIGHT_TYPE = 0x00000002;
  const mGTIN_FORMAT = 0x0000000c;
  const mPROCESSING = 0x00000010;
  const mMAIN_INGREDIENTS = 0x0000ff00;
  const mCONTENT = 0x00ff0000;
  const mUSES = 0x30000000;

  // product properties values
  const OWN = 0x00000000;
  const THIRD_PARTY = 0x00000001;
  const CATCH_WEIGHT = 0x00000000;
  const EVEN_WEIGHT = 0x00000002;
  const GTIN = 0x00000000;
  const EAN = 0x00000004;
  const UPC = 0x0000000c;
  const RAW = 0x00000000;
  const PROCESSED = 0x00000010;
  const BEEF = 0x00000100;
  const PORK = 0x00000200;
  const LAMB = 0x00000400;
  const POULTRY = 0x00000800;
  const SEAFOOD = 0x00001000;
  const VEGETABLES = 0x00002000;
  const GRAINS = 0x00004000;
  const SAUCES = 0x00100000;
  const ADDITIVES = 0x00200000;
  const OTHERS = 0x00400000;
  const PACKAGING = 0x00800000;
  const FOR_SALE = 0x10000000;
  const FOR_PRODUCTION = 0x20000000;

  const productUnits = ["box", "ea", "gal", "kg", "lbs", "litre", "oz", "roll"];
  const productUses = [
    {
      code: "MO",
      name: "Main Output",
      type: "O",
      sortOrder: 1,
      background: "#FFBBC1",
    },
    {
      code: "BY",
      name: "Byproduct",
      type: "O",
      sortOrder: 2,
      background: "#E8BBFF",
    },
    {
      code: "MI",
      name: "Main Input",
      type: "I",
      sortOrder: 3,
      background: "#FFF359",
    },
    { code: "AD", name: "Additive", type: "I", sortOrder: 4 },
    { code: "PK", name: "Packaging", type: "I", sortOrder: 5 },
  ];
  const productNumbers = {
    I: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    O: ["A", "B", "C", "D", "E"],
  };

  // production lot states
  const NEW = 0;
  const ENTERED = 1;
  const APPROVED = 2;
  const IN_PREP = 3;
  const IN_PRODUCTION = 4;
  const FINISHED = 5;
  const CLOSED = 6;
  const lotStates = [
    {},
    { name: "Entered", color: "inherit", background: "#FDFFA9" },
    { name: "Approved", color: "inherit", background: "#97FD90" },
    { name: "In Prep", color: "inherit", background: "#BAF7FF" },
    { name: "In Production", color: "inherit", background: "#84F0FE" },
    { name: "Finished", color: "inherit", background: "#A6A9FE" },
    { name: "Closed", color: "white", background: "#333333" },
  ];
  // production states
  const WORKSHOP_READY = 0;
  const PREP_STARTED = 1;
  const PREP_ENDED = 2;
  const PRODUCTION_STARTED = 3;
  const PRODUCTION_ENDED = 4;
  const IO_SCANS_FINISHED = 5;

  // product item statuses
  // production lot states
  const SHIPPED = 1;
  const CONSUMED = 2;
  const DISCARDED = 3;
  const IN_INVENTORY = 4;
  const itemStatuses = [
    { name: "", color: "inherit", background: "inherit" },
    { name: "Shipped", color: "inherit", background: "#FDFFA9" },
    { name: "Consumed", color: "inherit", background: "#97FD90" },
    { name: "Discarded", color: "inherit", background: "#A6A9FE" },
    { name: "In Inventory", color: "inherit", background: "#84F0FE" },
  ];

  // production log detail report titles
  // production log detail report types
  const PRODUCTION_OUTPUT = 1;
  const SHIPPING_MANIFEST = 2;
  const MATERIAL_CONSUMPTION = 3;
  const reportTitles = [
    "",
    "a production output report",
    "a shipping manifest",
    "a material consumption report",
  ];

  // rounding direction used in roundTime()
  const UP = "U";
  const DOWN = "D";

  // scanner modes
  const INPUT_AND_OUTPUT = "*";
  const RESIDUAL_INPUT = "";

  // GS1-128 barcode field handlers
  const gs1_gtin = function (data, scanner) {
    if (!/^[0-9]+$/.test(data)) scanner.err = "Invalid GTIN";
    else scanner.gtin = parseInt(data);
  };
  const gs1_kg = function (data, scanner) {
    if (!/^[0-9]+$/.test(data)) scanner.err = "Invalid weight";
    else if (data.charAt(0) != "0")
      scanner.err = `Unsupported GS1-128 application identifier: 31${data.charAt(
        0
      )}`;
    else {
      scanner.unit = "kg";
      gs1_weight(data, scanner);
    }
  };
  const gs1_lbs = function (data, scanner) {
    if (!/^[0-9]+$/.test(data)) scanner.err = "Invalid weight";
    else if (data.charAt(0) != "0")
      scanner.err = `Unsupported GS1-128 application identifier: 32${data.charAt(
        0
      )}`;
    else {
      scanner.unit = "lbs";
      gs1_weight(data, scanner);
    }
  };
  const gs1_oz = function (data, scanner) {
    if (!/^[0-9]+$/.test(data)) scanner.err = "Invalid weight";
    else if (data.charAt(0) != "7")
      scanner.err = `Unsupported GS1-128 application identifier: 35${data.charAt(
        0
      )}`;
    else {
      scanner.unit = "oz";
      gs1_weight(data, scanner);
    }
  };
  const gs1_weight = function (data, scanner) {
    const numDecimalPlaces = parseInt(data.substring(1, 2));
    if (numDecimalPlaces > 5) scanner.err = "Invalid weight";
    else
      scanner.quantity =
        parseInt(data.substring(2, 8 - numDecimalPlaces)).toString() +
        "." +
        (numDecimalPlaces > 0 ? data.slice(-numDecimalPlaces) : "");
  };
  const gs1_default = function (data, scanner) {};
  // supported GS1-128 application identifiers
  const GS1_128 = [
    { id: "01", length: 14, handler: gs1_gtin }, // GTIN
    { id: "10", length: 0, handler: gs1_default }, // batch/lot number
    { id: "11", length: 6, handler: gs1_default }, // production date
    { id: "13", length: 6, handler: gs1_default }, // packaging date
    { id: "15", length: 6, handler: gs1_default }, // sell-by date
    { id: "17", length: 6, handler: gs1_default }, // expiration date
    { id: "21", length: 0, handler: gs1_default }, // serial number
    { id: "31", length: 8, handler: gs1_kg }, // weight in kg
    { id: "32", length: 8, handler: gs1_lbs }, // weight in lbs
    { id: "35", length: 8, handler: gs1_oz }, // weight in oz
    { id: "90", length: 0, handler: gs1_default }, // private info
  ];

  const compareName = function (a, b) {
    return a.name.localeCompare(b.name, "en", {
      sensitivity: "base",
      ignorePunctuation: true,
    });
  };
  const compareCode = function (a, b) {
    return a.code.localeCompare(b.code, "en", {
      sensitivity: "base",
      ignorePunctuation: true,
    });
  };
  const compareLotNumber = function (a, b) {
    return a.lotnumber.localeCompare(b.lotnumber, "en", {
      sensitivity: "base",
      ignorePunctuation: true,
    });
  };
  const compareIOProduct = function (a, b) {
    if (a.defid != b.defid) return a.defid - b.defid;

    const ause = productUses.find((u) => u.code == a.use).sortOrder;
    const buse = productUses.find((u) => u.code == b.use).sortOrder;
    if (ause != buse) return ause - buse;

    const anum = !!a.number ? a.number.charCodeAt() : 128;
    const bnum = !!b.number ? b.number.charCodeAt() : 128;
    return anum - bnum;
  };
  const compareDate = function (a, b) {
    // compare dates of the format of "MM/DD/YY"
    if (a.substring(6) < b.substring(6)) return -1;
    else if (a.substring(6) > b.substring(6)) return 1;

    if (a.substring(0, 2) < b.substring(0, 2)) return -1;
    else if (a.substring(0, 2) > b.substring(0, 2)) return 1;

    if (a.substring(3, 5) < b.substring(3, 5)) return -1;
    else if (a.substring(3, 5) > b.substring(3, 5)) return 1;
    else return 0;
  };

  const checkTextField = function (scope, varName, fieldName, len, required) {
    if (
      eval(`scope.${varName} === undefined`) ||
      eval(`scope.${varName} === null`)
    ) {
      if (!required) return true;
      scope.errMsg = `${fieldName} must be specified.`;
      return false;
    }
    eval(`scope.${varName} = scope.${varName}.trim()`);
    if (eval(`scope.${varName}.length`) == 0) {
      eval(`scope.${varName} = null`);
      if (!required) return true;
      scope.errMsg = `${fieldName} must be specified.`;
      return false;
    }
    if (eval(`scope.${varName}.length`) > len) {
      scope.errMsg = `${fieldName} is too long. Keep it up to ${len} character(s).`;
      return false;
    }
    return true;
  };

  // a modal dialog with buttons, Yes and No; callback is called with true for Yes and false for No
  const confirm = function (msg, cb) {
    BootstrapDialog.confirm({
      title: "Confirmation",
      type: BootstrapDialog.TYPE_DANGER,
      message: msg,
      btnCancelLabel: "No",
      btnOKLabel: "Yes",
      callback: cb,
    });
  };

  // a modal dialog with a button, OK; callback, if any, is called
  const alert = function (msg, cb) {
    BootstrapDialog.alert({
      title: "Alert",
      type: BootstrapDialog.TYPE_DANGER,
      message: msg,
      callback: cb,
    });
  };

  // a modal dialog with a button, OK
  const notify = function (msg) {
    BootstrapDialog.alert({
      title: "Info",
      type: BootstrapDialog.TYPE_PRIMARY,
      message: msg,
    });
  };

  // scroll the table so that the row is shown
  const autoScrollTable = function (tableCssSelector, table, row, useid) {
    const tableElement = $(tableCssSelector);
    const tableHeight = tableElement.height();
    const tableScrollHeight = tableElement.prop("scrollHeight");
    const rowHeight = parseInt($(tableCssSelector + " tr").css("height"));
    const rowIndex = useid
      ? table.findIndex((e) => e.id == row.id)
      : table.findIndex((e) => e.code == row.code);

    let top = Math.min(rowHeight * rowIndex, tableScrollHeight - tableHeight);
    tableElement.scrollTop(top);
  };

  // scroll the table up by one row
  const scrollUpTable = function (tableCssSelector) {
    const tableElement = $(tableCssSelector);
    const rowHeight = parseInt($(tableCssSelector + " tr").css("height"));
    let top = tableElement.scrollTop();
    top = Math.max(top - rowHeight, 0);
    tableElement.scrollTop(top);
  };

  const initDatePicker = function (scope) {
    if (!!scope.selectedLocation) {
      scope.today = moment.tz(scope.selectedLocation.tz).format("MM/DD/YY");
      if (!scope.date) {
        scope.date = scope.today;
        scope.datePicker.setDate(scope.date);
      }
    }
  };
  const initTimePickers = function (scope) {
    let options = {};
    if (!!scope.factoryData.workshopsopen) {
      options["minTime"] = scope.factoryData.workshopsopen;
    }
    if (!!scope.factoryData.workshopsclose) {
      options["maxTime"] = scope.factoryData.workshopsclose;
    }
    if (Object.keys(options).length > 0) {
      $("#start-time").timepicker("option", options);
      $("#end-time").timepicker("option", options);
      $("#prep-start-time").timepicker("option", options);
      $("#prep-end-time").timepicker("option", options);
      $("#production-start-time").timepicker("option", options);
      $("#production-end-time").timepicker("option", options);
    }
  };
  const roundTime = function (time, direction) {
    let hour = parseInt(time.substring(0, 2));
    let min = parseInt(time.substring(3));
    min = direction == UP ? Math.ceil(min / 5) * 5 : Math.floor(min / 5) * 5;
    if (min == 60) {
      hour += 1;
      min = 0;
    }
    return (
      hour.toString().padStart(2, "0") + ":" + min.toString().padStart(2, "0")
    );
  };
  const preprocessLocationData = function (scope, locationData, entityData) {
    if (!!entityData) {
      scope.locationData = locationData.filter((l) => {
        if (entityData.find((e) => e.code == l.entity).type != "PR")
          return false;
        return l.op && !l.hq;
      });
    } else {
      scope.locationData = locationData.filter((l) => l.op && !l.hq);
    }
  };
  const processLotData = function (scope) {
    scope.productionLots.forEach((l) => {
      if (!!l.reviewedat) {
        l.state = CLOSED;
      } else if (!!l.finishedat) {
        l.state = FINISHED;
        l.productionState = IO_SCANS_FINISHED;
      } else if (!!l.approvedat) {
        if (!!l.productionstart) {
          l.state = IN_PRODUCTION;
          if (!!l.productionend) l.productionState = PRODUCTION_ENDED;
          else l.productionState = PRODUCTION_STARTED;
        } else if (!!l.prepstart) {
          l.state = IN_PREP;
          if (!!l.prepend) l.productionState = PREP_ENDED;
          else l.productionState = PREP_STARTED;
        } else {
          l.state = APPROVED;
          l.productionState = WORKSHOP_READY;
        }
      } else {
        l.state = ENTERED;
      }

      l.workshopName = scope.workshops.find((w) => w.id == l.workshop).name;
      const ioDef = scope.ioDefs.find((i) => i.id == l.iodef);
      l.ioDefName =
        ioDef.name + (ioDef.description ? " - " + ioDef.description : "");
      l.ioDefProducts = scope.ioProducts
        .filter((p) => p.defid == l.iodef && p.inuse)
        .sort(compareIOProduct);
      l.targetProduct = scope.ioProducts.find((p) => p.id == l.product);
      l.targetProductName = l.targetProduct.code + " - " + l.targetProduct.name;
      l.statusName = lotStates[l.state].name;
      if (l.state < IN_PRODUCTION) l.ioProducts = l.ioDefProducts;
      else {
        scope.getIOProductsData(l);
      }
    });
    scope.productionLots.sort(compareLotNumber);
  };
  const processTags = function (scope, tags, isForSearch) {
    const codes = tags.split(",").map((t) => t.trim());
    const tagList = isForSearch
      ? scope.searchParams.tagList
      : scope.lotInfo.tagList;
    codes.forEach((code) => {
      if (!!tagList.find((t) => t.code == code)) return;

      const specialProgram = scope.specialPrograms.find((p) => p.code == code);
      tagList.push({
        id: !!specialProgram ? specialProgram.id : 0,
        code: code,
        description: !!specialProgram ? specialProgram.description : "",
      });
    });
  };
  const calcYields = function (scope, ioProducts) {
    let pList = ioProducts.map((p) => {
      return {
        ioProduct: p,
        qty:
          parseFloat(p.qty) +
          (!!p.subboxqty ? parseFloat(p.subboxqty) : 0) -
          (!!p.residueqty ? parseFloat(p.residueqty) : 0),
        use: p.use,
        unit: p.unit,
        number: p.number,
        defaultNumber: null,
        formula: p.formula,
      };
    });
    let inputNumber = "1".charCodeAt();
    let outputNumber = "A".charCodeAt();
    pList.forEach((p) => {
      // all weight units are automatically converted to lbs before calculating yields
      switch (p.unit) {
        case "oz":
          p.qty *= 0.0625;
          break;
        case "kg":
          p.qty *= 2.20462;
          break;
        default:
          break;
      }
      switch (p.use) {
        case "MI":
          p.defaultNumber = String.fromCharCode(inputNumber++);
          break;
        case "MO":
        case "BY":
          p.defaultNumber = String.fromCharCode(outputNumber++);
          break;
        default:
          break;
      }
    });
    let inputSum = 0;
    pList.forEach((p) => {
      if (p.use == "MI") inputSum += p.qty;
    });
    pList.forEach((p) => {
      if (p.use == "MO" || p.use == "BY") {
        if (!!p.formula) p.ioProduct.yield = useFormula(p.formula, pList);
        else p.ioProduct.yield = ((p.qty / inputSum) * 100).toFixed(1);
      }
    });
    scope.finishAndUpdateYields();
    return;

    function useFormula(formula, pList) {
      let v = {
        $1: 0,
        $2: 0,
        $3: 0,
        $4: 0,
        $5: 0,
        $6: 0,
        $7: 0,
        $8: 0,
        $9: 0,
        $A: 0,
        $B: 0,
        $C: 0,
        $D: 0,
        $E: 0,
      };
      let result;

      pList.forEach((p) => {
        if (!!p.number) v["$" + p.number] += p.qty;
      });

      try {
        result = eval(formula.replaceAll("$", "v.$"));
      } catch (err) {
        return null;
      }

      if (typeof result != "number") return null;
      if (result == Infinity || result == -Infinity) return null;

      return (result * 100).toFixed(1);
    }
  };
  const statusCellColor = function (state) {
    // to change the color of the status field of a row in the production lots table
    return {
      color: lotStates[state].color,
      "background-color": lotStates[state].background,
    };
  };
  const productCellColor = function (use) {
    // to change the color of the product field of a row in the i/o products table
    const u = productUses.find((u) => u.code == use);
    return !!u && !!u.background ? { "background-color": u.background } : {};
  };
  const itemStatusCellColor = function (status = 0) {
    // to change the color of the status field of a row in the input/output details table
    return {
      color: itemStatuses[status].color,
      "background-color": itemStatuses[status].background,
    };
  };
  const itemStatusName = function (status = 0) {
    return itemStatuses[status].name;
  };
  const productUse = function (use) {
    // return the display name of the given product use
    const u = productUses.find((u) => u.code == use);
    return !!u ? u.name : "";
  };
  const integer = function (product) {
    return !!product.actualnumboxes
      ? Math.floor(product.actualnumboxes)
      : product.numboxes;
  };
  const fractional = function (product) {
    return !!product.actualnumboxes
      ? "." + product.actualnumboxes.toFixed(1).split(".")[1]
      : " ";
  };
  const totalQty = function (product) {
    if (product.qty === undefined) return null;
    else
      return (
        parseFloat(product.qty) +
        parseFloat(!!product.subboxqty ? product.subboxqty : "0") -
        parseFloat(!!product.residueqty ? product.residueqty : "0")
      ).toFixed(2);
  };
  const dec2 = function (number) {
    // round a number to two decimal places
    return Math.round(number * 100) / 100;
  };
  const clearIODefDataFields = function (scope) {
    scope.ioDefName = "";
    scope.ioDefDescription = "";
  };
  const clearLotInfoDataFields = function (scope) {
    scope.lotInfo = {};
    scope.lotInfo.tagList = [];
    initTimePickers(scope);
  };
  const clearIOProductDataFields = function (scope, keepType) {
    scope.ioProductCode = "";
    scope.ioProductName = "";
    if (!keepType) scope.ioProductType = false; // NOT a generic product
    scope.ioProductUnit = "";
    scope.ioProductUse = null;
    scope.ioProductNumber = "";
    scope.ioProductFormula = "";
    scope.ioProductList = scope.productList;

    if (!!scope.ioProductType)
      // generic
      scope.productUses = productUses.filter((u) => u.type == "I");
    else scope.productUses = productUses;
  };
  const clearGenericProductDataFields = function (scope) {
    scope.genericProductCode = "";
    scope.genericProductName = "";
    scope.genericProductDescription = "";
  };
  const clearSearchFields = function (scope) {
    scope.searchCode = "";
    scope.searchName = "";
    scope.searchManufacturersOwn = false;
    scope.searchThirdParty = false;
    scope.searchForSale = false;
    scope.searchForProduction = false;
  };
  const clearSpecialProgramDataFields = function (scope) {
    scope.specialProgramCode = "";
    scope.specialProgramDescription = "";
  };
  const clearWorkshopDataFields = function (scope) {
    scope.workshopName = "";
    scope.monitoringLocationList = [];
  };
  const searchProduct = function (scope, isGeneric) {
    scope.filteredProductList = isGeneric
      ? scope.genericProductList
      : scope.productList;
    if (scope.searchCode) {
      const code = scope.searchCode;
      scope.filteredProductList = scope.filteredProductList.filter((p) =>
        p.code.startsWith(code)
      );
    }
    if (!isGeneric) {
      if (scope.searchManufacturersOwn != scope.searchThirdParty) {
        if (scope.searchManufacturersOwn)
          scope.filteredProductList = scope.filteredProductList.filter(
            (p) => !(p.properties & mSOURCE)
          );
        else
          scope.filteredProductList = scope.filteredProductList.filter(
            (p) => !!(p.properties & mSOURCE)
          );
      }
      let mask = 0x00000000;
      if (scope.searchForSale) mask |= FOR_SALE;
      if (scope.searchForProduction) mask |= FOR_PRODUCTION;
      if (mask) {
        scope.filteredProductList = scope.filteredProductList.filter(
          (p) => !!(p.properties & mask)
        );
      }
    }
    if (scope.searchName) {
      const keywords = scope.searchName
        .toLowerCase()
        .split(/[,]+/)
        .map((k) => k.trim());
      if (!keywords.length) return;
      scope.filteredProductList = scope.filteredProductList.filter((p) => {
        const target = (
          p.name + (p.description ? p.description : "")
        ).toLowerCase();
        for (let i = 0; i < keywords.length; i++) {
          if (keywords[i] && target.includes(keywords[i])) return true;
        }
        return false;
      });
    }

    if (!!scope.selectedProduct) {
      if (
        scope.filteredProductList.find(
          (p) => p.code == scope.selectedProduct.code
        )
      ) {
        setTimeout(function () {
          autoScrollTable(
            ".products-to-select table tbody",
            scope.filteredProductList,
            scope.selectedProduct
          );
        }, 0);
        return;
      }
      scope.selectedProduct = null;
    }
  };

  /*****************************************************************************************/
  const dashboardController = function (
    $scope,
    $rootScope,
    $http,
    userService,
    entityData,
    locationData,
    productData
  ) {
    preprocessLocationData(
      $scope,
      locationData,
      userService.role == "SU" ? entityData : null
    );
    $scope.lotStates = lotStates;

    const dashboardHeartbeat = function () {
      if (dashboardHeartbeat.counter === undefined)
        dashboardHeartbeat.counter = 0;
      $scope.currentTime = moment
        .tz($scope.selectedLocation.tz)
        .format("HH:mm");
      $scope.$apply();
      if (++dashboardHeartbeat.counter % 120 == 0) {
        // run keepalive every 20 min
        $http
          .post("/keepalive", {
            user: userService.username,
            token: userService.token,
          })
          .then(
            function (res) {},
            function (err) {
              console.log("keepalive failed: ");
            }
          );
      } else if (dashboardHeartbeat.counter % 6 == 0) {
        // run this every minute
        refreshProductionLots();
      }
    };
    const refreshProductionLots = function () {
      mask();
      $http
        .post("/production/lots", {
          user: userService.username,
          token: userService.token,
          location: $scope.selectedLocation.code,
          timezone: $scope.selectedLocation.tz,
          date: $scope.date,
        })
        .then(
          function (res) {
            const id = !!$scope.selectedLot ? $scope.selectedLot.id : null;
            $scope.productionLots = res.data.rows;
            processLotData($scope);
            $scope.workshopChanged(true);
            $scope.selectLot(id);
            unmask();
          },
          function (err) {
            unmake();
            alert(
              "There was an error in retrieving production lots data from the database."
            );
          }
        );
    };
    const updateLotInfoIOProducts = function (ioProducts) {
      $scope.lotInfo.ioProducts = ioProducts;
    };
    const updateTargetProductInfo = function (lot) {
      const targetProduct = lot.ioProducts.find(
        (p) => p.code == lot.targetProduct.code
      );
      if (!!targetProduct && !!targetProduct.qty) {
        if (lot.unit == "box") lot.performance = targetProduct.numboxes;
        else lot.performance = targetProduct.qty;

        lot.yield = targetProduct.yield;
      }
    };

    $scope.locationChanged = function () {
      if ($rootScope.dashboardHeartbeatInterval) {
        clearInterval($rootScope.dashboardHeartbeatInterval);
        delete $rootScope.dashboardHeartbeatInterval;
      }
      if (!$scope.selectedLocation) {
        $scope.workshops = [];
        $selectedWorkshop = null;
        $scope.workshopChanged();
        $scope.currentTime = null;
        return;
      }

      $scope.currentTime = moment
        .tz($scope.selectedLocation.tz)
        .format("HH:mm");
      $rootScope.dashboardHeartbeatInterval = setInterval(
        dashboardHeartbeat,
        10000
      ); // run dashboardHeartbeat every 10 seconds

      mask();
      $scope.today = moment
        .tz($scope.selectedLocation.tz)
        .format("ddd. MM/DD.");
      $scope.date = moment.tz($scope.selectedLocation.tz).format("MM/DD/YY");
      const p0 = $http.post("/production/workshops/all", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
      });
      const p1 = $http.post("/production/lots", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
        timezone: $scope.selectedLocation.tz,
        date: $scope.date,
      });
      let p = [p0, p1];

      if (
        !$scope.selectedEntity ||
        $scope.selectedEntity != $scope.selectedLocation.entity
      ) {
        const p2 = $http.post("/production/iodefinitions/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p2);
        const p3 = $http.post("/production/ioproducts/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p3);
        const p4 = $http.post("/production/specialprograms/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p4);
      }
      Promise.all(p).then(
        function (res) {
          $scope.workshops = res[0].data.rows;
          $scope.productionLots = res[1].data.rows;
          if (p.length > 2) {
            $scope.ioDefs = res[2].data.rows;
            $scope.ioProducts = res[3].data.rows;
            $scope.specialPrograms = res[4].data.rows;
            $scope.selectedEntity = $scope.selectedLocation.entity;
          }
          processLotData($scope);
          $scope.selectedWorkshop = null;
          $scope.workshopChanged();
          $scope.$apply();
          unmask();
        },
        function (err) {
          $scope.workshops = [];
          $scope.factoryData = {};
          $scope.productionLots = [];
          if (p.length > 3) {
            $scope.ioDefs = [];
            $scope.ioProducts = [];
            $scope.selectedEntity = null;
          }
          $scope.selectedWorkshop = null;
          $scope.workshopChanged();
          $scope.$apply();
          unmask();
          alert(
            "There was an error in retrieving production lots data from the database."
          );
        }
      );
    };
    $scope.workshopChanged = function (doNotAutoSelectLot) {
      $scope.lotsForWorkshop = !!$scope.selectedWorkshop
        ? $scope.productionLots.filter(
            (l) => l.workshop == $scope.selectedWorkshop.id
          )
        : $scope.productionLots;
      if (!!doNotAutoSelectLot) return;

      if ($scope.lotsForWorkshop.length > 0)
        $scope.selectLot($scope.lotsForWorkshop[0].id);
      else $scope.selectedLot = null;
    };
    $scope.getIOProductsData = function (lot) {
      // refresh ioProducts of the given lot with the latest info from database and run updateLotInfoIOProducts for selectedLot
      mask();
      const p0 = $http.post("/production/lot/inputs", {
        user: userService.username,
        token: userService.token,
        id: lot.id,
      });
      const p1 = $http.post("/production/lot/outputs", {
        user: userService.username,
        token: userService.token,
        id: lot.id,
      });
      Promise.all([p0, p1]).then(
        function (res) {
          const inputs = res[0].data.rows;
          const outputs = res[1].data.rows;
          lot.ioProducts = inputs.concat(outputs);
          lot.ioProducts.forEach((ip) => {
            const product = productData.find((p) => p.code == ip.code);
            ip.name =
              product.name +
              (product.description ? " - " + product.description : "");
          });
          lot.ioProducts.sort(compareIOProduct);
          updateTargetProductInfo(lot);
          if (!!$scope.selectedLot && $scope.selectedLot == lot)
            updateLotInfoIOProducts(lot.ioProducts);
          $scope.$apply();
          unmask();
        },
        function (err) {
          $scope.$apply();
          unmask();
          alert(
            "There was an error in retrieving production results from the database."
          );
        }
      );
    };
    $scope.statusCellColor = statusCellColor;
    $scope.productCellColor = productCellColor;
    $scope.productUse = productUse;
    $scope.integer = integer;
    $scope.fractional = fractional;
    $scope.totalQty = totalQty;
    $scope.selectLot = function (id) {
      const lot = $scope.lotsForWorkshop.find((l) => l.id == id);

      $scope.selectedLot = lot;
      $scope.lotInfo = {};
      if (!lot) return;

      $scope.lotInfo.lotNumber = lot.lotnumber;
      $scope.lotInfo.start = lot.start;
      $scope.lotInfo.end = lot.end;
      $scope.lotInfo.workshop = $scope.workshops.find(
        (w) => w.id == lot.workshop
      );
      $scope.lotInfo.ioDef = $scope.ioDefs.find((i) => i.id == lot.iodef);
      $scope.lotInfo.ioDefProducts = lot.ioDefProducts;
      $scope.lotInfo.ioProducts = lot.ioProducts;
      $scope.lotInfo.targetProduct = lot.targetProduct;
      $scope.lotInfo.target = lot.target;
      $scope.lotInfo.unit = lot.unit;
      $scope.lotInfo.orderNumber = lot.ordernumber;
      $scope.lotInfo.tags = lot.tags;
      $scope.lotInfo.tagList = [];
      if (!!lot.tags) processTags($scope, lot.tags);
      $scope.lotInfo.instructions = lot.instructions;
      $scope.lotInfo.sideNote = lot.sidenote;
      $scope.lotInfo.comments = lot.comments;
      $scope.lotInfo.prepStart = lot.prepstart;
      $scope.lotInfo.prepEnd = lot.prepend;
      $scope.lotInfo.productionStart = lot.productionstart;
      $scope.lotInfo.productionEnd = lot.productionend;
      $scope.lotInfo.state = lot.state;
      $scope.lotInfo.productionState = lot.productionState;

      resize();
    };

    if ($scope.locationData.length == 1) {
      $scope.selectedLocation = $scope.locationData[0];
      $scope.locationChanged();
    }
  };

  /*****************************************************************************************/
  const productionLotsController = function (
    $scope,
    $rootScope,
    $state,
    $http,
    userService,
    entityData,
    locationData,
    productData
  ) {
    $scope.datePicker = new Pikaday({
      field: document.getElementById("datepicker"),
      format: "MM/DD/YY",
    });
    preprocessLocationData(
      $scope,
      locationData,
      userService.role == "SU" ? entityData : null
    );
    $scope.lotStates = lotStates;
    $("#start-time").timepicker({
      step: 5,
      timeFormat: "H:i",
      disableTextInput: true,
    });
    $("#end-time").timepicker({
      step: 5,
      timeFormat: "H:i",
      disableTextInput: true,
    });
    $("#prep-start-time").timepicker({
      step: 5,
      timeFormat: "H:i",
      disableTextInput: true,
    });
    $("#prep-end-time").timepicker({
      step: 5,
      timeFormat: "H:i",
      disableTextInput: true,
    });
    $("#production-start-time").timepicker({
      step: 5,
      timeFormat: "H:i",
      disableTextInput: true,
    });
    $("#production-end-time").timepicker({
      step: 5,
      timeFormat: "H:i",
      disableTextInput: true,
    });
    $scope.updateAllowed = userService.rank <= 4; // SU, BA, BE, LA, LE
    $scope.approvalAllowed = userService.rank <= 5; // SU, BA, BE, LA, LE, LM

    const initTabs = function () {
      $scope.tab1Order = 1;
      $scope.tab2Order = 2;
      $scope.tab3Order = 3;
      $scope.showInstructions = true;
      $scope.showSideNote = false;
      $scope.showComments = false;
    };
    const checkData = function () {
      if (!checkTextField($scope, "lotInfo.lotNumber", "Lot Number", 5, true))
        return false;
      if (!$scope.lotInfo.start || !$scope.lotInfo.end) {
        $scope.errMsg = "Start time and end time must be specified.";
        return false;
      }
      if ($scope.lotInfo.start.localeCompare($scope.lotInfo.end) >= 0) {
        $scope.errMsg = "Invalid order of start time and end time.";
        return false;
      }
      if (!$scope.lotInfo.workshop) {
        $scope.errMsg = "Workshop must be specified.";
        return false;
      }
      if (!$scope.lotInfo.ioDef) {
        $scope.errMsg = "I/O definition must be specified.";
        return false;
      }
      if (!$scope.lotInfo.targetProduct) {
        $scope.errMsg = "Target output product must be specified.";
        return false;
      }
      if (!checkTextField($scope, "lotInfo.target", "Target quantity", 4, true))
        return false;
      if (!/^\d+?$/.test($scope.lotInfo.target)) {
        $scope.errMsg = "Quantity must be a whole number.";
        return false;
      }
      if (!checkStartEnd()) {
        $scope.errMsg =
          "Planned start time and duration conflict with other production lots.";
        return false;
      }
      if (
        !checkTextField(
          $scope,
          "lotInfo.orderNumber",
          "Order Number",
          15,
          false
        )
      )
        return false;

      $scope.lotInfo.tags = $scope.lotInfo.tagList
        .map((t) => t.code)
        .join(", ");
      if (
        !checkTextField(
          $scope,
          "lotInfo.tags",
          "Special Program Tags",
          50,
          false
        )
      )
        return false;

      if ($scope.isNew) {
        $scope.newLot = {};
        $scope.newLot.date = $scope.date;
        $scope.newLot.lotnumber = $scope.lotInfo.lotNumber;
        $scope.newLot.start = $scope.lotInfo.start;
        $scope.newLot.end = $scope.lotInfo.end;
        $scope.newLot.workshop = $scope.lotInfo.workshop.id;
        $scope.newLot.iodef = $scope.lotInfo.ioDef.id;
        $scope.newLot.product = $scope.lotInfo.targetProduct.id;
        $scope.newLot.target = parseInt($scope.lotInfo.target);
        $scope.newLot.unit = !!$scope.lotInfo.unit
          ? $scope.lotInfo.targetProduct.unit
          : "box";
        $scope.newLot.ordernumber = $scope.lotInfo.orderNumber;
        $scope.newLot.instructions = $scope.lotInfo.instructions;
        $scope.newLot.tags = $scope.lotInfo.tags;
        $scope.newLot.sidenote = $scope.lotInfo.sideNote;
      } else {
        $scope.updatedLot = {
          id: $scope.selectedLot.id,
          date: $scope.date,
        };
        if ($scope.lotInfo.state < APPROVED) {
          // before APPROVED
          if ($scope.lotInfo.lotNumber != $scope.selectedLot.lotnumber)
            $scope.updatedLot.lotnumber = $scope.lotInfo.lotNumber;
          if ($scope.lotInfo.start != $scope.selectedLot.start)
            $scope.updatedLot.start = $scope.lotInfo.start;
          if ($scope.lotInfo.end != $scope.selectedLot.end)
            $scope.updatedLot.end = $scope.lotInfo.end;
          if ($scope.lotInfo.workshop.id != $scope.selectedLot.workshop)
            $scope.updatedLot.workshop = $scope.lotInfo.workshop.id;
          if ($scope.lotInfo.ioDef.id != $scope.selectedLot.iodef)
            $scope.updatedLot.iodef = $scope.lotInfo.ioDef.id;
          if ($scope.lotInfo.targetProduct.id != $scope.selectedLot.product)
            $scope.updatedLot.product = $scope.lotInfo.targetProduct.id;
          if ($scope.lotInfo.target != $scope.selectedLot.target)
            $scope.updatedLot.target = parseInt($scope.lotInfo.target);
          const unit = !!$scope.lotInfo.unit
            ? $scope.lotInfo.targetProduct.unit
            : "box";
          if (unit != $scope.selectedLot.unit) $scope.updatedLot.unit = unit;
          if ($scope.lotInfo.orderNumber != $scope.selectedLot.ordernumber)
            $scope.updatedLot.ordernumber = $scope.lotInfo.orderNumber;
          if ($scope.lotInfo.instructions != $scope.selectedLot.instructions)
            $scope.updatedLot.instructions = $scope.lotInfo.instructions;
          if ($scope.lotInfo.tags != $scope.selectedLot.tags)
            $scope.updatedLot.tags = $scope.lotInfo.tags;
          if ($scope.lotInfo.sideNote != $scope.selectedLot.sidenote)
            $scope.updatedLot.sidenote = $scope.lotInfo.sideNote;
        } else {
          // APPROVED and beyond
          if (!checkPrepProductionStartEnd()) {
            // $scope.errMsg is set in the function
            return false;
          }
          if ($scope.lotInfo.sideNote != $scope.selectedLot.sidenote)
            $scope.updatedLot.sidenote = $scope.lotInfo.sideNote;
          if ($scope.lotInfo.prepStart != $scope.selectedLot.prepstart)
            $scope.updatedLot.prepstart = $scope.lotInfo.prepStart;
          if ($scope.lotInfo.prepEnd != $scope.selectedLot.prepend)
            $scope.updatedLot.prepend = $scope.lotInfo.prepEnd;
          if (
            $scope.lotInfo.productionStart != $scope.selectedLot.productionstart
          )
            $scope.updatedLot.productionstart = $scope.lotInfo.productionStart;
          if ($scope.lotInfo.productionEnd != $scope.selectedLot.productionend)
            $scope.updatedLot.productionend = $scope.lotInfo.productionEnd;
          if ($scope.lotInfo.comments != $scope.selectedLot.comments)
            $scope.updatedLot.comments = $scope.lotInfo.comments;
        }
      }
      return true;
    };
    const checkStartEnd = function () {
      if (!!$scope.factoryData.isoverlapallowed)
        // production lots are allowed to overlap with each other
        return true;

      const id = !!$scope.selectedLot ? $scope.selectedLot.id : null;
      const lotsAtTheSameWorkshop = $scope.productionLots.filter(
        (l) => l.workshop == $scope.lotInfo.workshop.id && l.id != id
      );
      for (const l of lotsAtTheSameWorkshop) {
        if (
          (l.start.localeCompare($scope.lotInfo.start) <= 0 &&
            l.end.localeCompare($scope.lotInfo.start) > 0) ||
          (l.start.localeCompare($scope.lotInfo.end) < 0 &&
            l.end.localeCompare($scope.lotInfo.end) >= 0)
        )
          return false;
      }
      return true;
    };
    const checkPrepProductionStartEnd = function () {
      let defined = !!$scope.lotInfo.productionEnd;
      if (defined && !$scope.lotInfo.productionStart) {
        $scope.errMsg = "Missing production start time.";
        return false;
      }
      defined = defined || !!$scope.lotInfo.productionStart;
      if (defined && !$scope.lotInfo.prepEnd) {
        $scope.errMsg = "Missing prep end time.";
        return false;
      }
      defined = defined || !!$scope.lotInfo.prepEnd;
      if (defined && !$scope.lotInfo.prepStart) {
        $scope.errMsg = "Missing prep start time.";
        return false;
      }

      if (!!$scope.lotInfo.prepStart) {
        if (!!$scope.lotInfo.prepEnd) {
          if (
            $scope.lotInfo.prepStart.localeCompare($scope.lotInfo.prepEnd) > 0
          ) {
            $scope.errMsg = "Prep cannot end before it is started.";
            return false;
          }
          if (!!$scope.lotInfo.productionStart) {
            if (
              $scope.lotInfo.prepEnd.localeCompare(
                $scope.lotInfo.productionStart
              ) > 0
            ) {
              $scope.errMsg = "Production cannot start before prep ends.";
              return false;
            }
            if (!!$scope.lotInfo.productionEnd) {
              if (
                $scope.lotInfo.productionStart.localeCompare(
                  $scope.lotInfo.productionEnd
                ) > 0
              ) {
                $scope.errMsg = "Production cannot end before it is started.";
                return false;
              }
            }
          }
        }
      }

      if (!!$scope.factoryData.isoverlapallowed)
        // production lots are allowed to overlap with each other
        return true;

      const lotsAtTheSameWorkshop = $scope.productionLots.filter(
        (l) =>
          l.workshop == $scope.lotInfo.workshop.id &&
          l.id != $scope.selectedLot.id
      );
      const maxTime = !!$scope.factoryData.workshopsclose
        ? $scope.factoryData.workshopsclose
        : "24:00";
      if (!$scope.lotInfo.prepStart) return true;

      let endTime;
      if (!!$scope.lotInfo.prepEnd) {
        if (!!$scope.lotInfo.productionStart) {
          if (!!$scope.lotInfo.productionEnd) {
            endTime = $scope.lotInfo.productionEnd;
          } else {
            endTime = $scope.lotInfo.productionStart;
          }
        } else {
          endTime = $scope.lotInfo.prepEnd;
        }
      } else {
        endTime = $scope.lotInfo.prepStart;
      }
      for (const l of lotsAtTheSameWorkshop) {
        if (!l.prepstart) continue;
        const end = !!l.productionend ? l.productionend : maxTime;
        if (
          (l.prepstart.localeCompare($scope.lotInfo.prepStart) < 0 &&
            end.localeCompare($scope.lotInfo.prepStart) > 0) ||
          (l.prepstart.localeCompare(endTime) < 0 &&
            end.localeCompare(endTime) > 0)
        ) {
          $scope.errMsg =
            "Prep time and/or production time are in conflict with other production lots.";
          return false;
        }
      }
      return true;
    };
    const updateSelectedLot = function () {
      const keys = Object.keys($scope.updatedLot);
      keys.forEach((k) => {
        $scope.selectedLot[k] = $scope.updatedLot[k];
        switch (k) {
          case "workshop":
            $scope.selectedLot.workshopName = $scope.workshops.find(
              (w) => w.id == $scope.updatedLot.workshop
            ).name;
            break;
          case "iodef":
            const ioDef = $scope.ioDefs.find(
              (i) => i.id == $scope.updatedLot.iodef
            );
            $scope.selectedLot.ioDefName =
              ioDef.name + (ioDef.description ? " - " + ioDef.description : "");
            $scope.selectedLot.ioDefProducts = $scope.ioProducts
              .filter((p) => p.defid == ioDef.id && p.inuse)
              .sort(compareIOProduct);
            if ($scope.selectedLot.state < IN_PRODUCTION)
              // it should always be the case
              $scope.selectedLot.ioProducts = $scope.selectedLot.ioDefProducts;
            break;
          case "product":
            $scope.selectedLot.targetProduct = $scope.ioProducts.find(
              (p) => p.id == $scope.updatedLot.product
            );
            $scope.selectedLot.targetProductName =
              $scope.selectedLot.targetProduct.code +
              " - " +
              $scope.selectedLot.targetProduct.name;
            break;
          default:
            break;
        }
      });

      switch ($scope.selectedLot.state) {
        case APPROVED:
          if (!!$scope.selectedLot.productionstart)
            $scope.selectedLot.state = IN_PRODUCTION;
          else if (!!$scope.selectedLot.prepstart)
            $scope.selectedLot.state = IN_PREP;
          break;
        case IN_PREP:
          if (!!$scope.selectedLot.productionstart)
            $scope.selectedLot.state = IN_PRODUCTION;
          break;
        default:
          break;
      }
      $scope.selectedLot.statusName = lotStates[$scope.selectedLot.state].name;

      if ($scope.updatedLot.lotnumber !== undefined) {
        $scope.productionLots.sort(compareLotNumber);
      }
    };
    const refreshIOProducts = function () {
      $scope.productionLots.forEach((l) => {
        if (l.state == IN_PRODUCTION) {
          if (!!$scope.selectedLot && $scope.selectedLot.id == l.id)
            $scope.getIOProductsData(
              $scope.selectedLot,
              updateLotInfoIOProducts,
              true
            );
          else $scope.getIOProductsData(l, null, true);
        }
      });
    };
    const updateLotInfoIOProducts = function (ioProducts) {
      $scope.lotInfo.ioProducts = ioProducts;
      $scope.$apply();
    };
    const refreshGenericInventory = function (ioProducts) {
      ioProducts.forEach((p) => {
        if (p.type != "G") return;
        if (!p.inventory || new Date() - p.inventoryRefreshedAt > 300000) {
          // no inventory data or data older than 5 min
          $http
            .post("/production/genericproduct/inventory", {
              user: userService.username,
              token: userService.token,
              entity: $scope.selectedLocation.entity,
              location: $scope.selectedLocation.code,
              product: p.code,
            })
            .then(
              function (res) {
                p.inventory = res.data.rows;
                p.inventoryRefreshedAt = new Date();
              },
              function (err) {
                p.inventory = null;
                p.inventoryRefreshedAt = null;
              }
            );
        }
      });
    };

    $scope.locationChanged = function () {
      if (!$scope.selectedLocation) {
        $scope.workshops = [];
        $scope.factoryData = {};
        $scope.ioDefs = [];
        $scope.ioProducts = [];
        $scope.specialPrograms = [];
        $scope.today = null;
        return;
      }

      mask();
      const p0 = $http.post("/production/workshops/all", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
      });
      const p1 = $http.post("/production/location/factory", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
      });
      let p = [p0, p1];
      if (
        !$scope.selectedEntity ||
        $scope.selectedEntity != $scope.selectedLocation.entity
      ) {
        const p2 = $http.post("/production/iodefinitions/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p2);
        const p3 = $http.post("/production/ioproducts/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p3);
        const p4 = $http.post("/production/specialprograms/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p4);
      }
      Promise.all(p).then(
        function (res) {
          $scope.workshops = res[0].data.rows;
          $scope.factoryData = res[1].data.rows[0];
          if (p.length > 2) {
            $scope.ioDefs = res[2].data.rows;
            $scope.ioDefs.sort(compareName);
            $scope.ioProducts = res[3].data.rows;
            $scope.specialPrograms = res[4].data.rows;
            $scope.selectedEntity = $scope.selectedLocation.entity;
          }
          unmask();
          initDatePicker($scope); // $scope.today is set in initDatePicker()
          initTimePickers($scope);
          $scope.dateChanged(); // $scope.$apply() is not needed here because $http.post is called in $scope.dateChanged()
          // and callbacks of $http.post are executed in $scope.$apply()
        },
        function (err) {
          $scope.workshops = [];
          $scope.factoryData = {};
          if (p.length > 2) {
            $scope.ioDefs = [];
            $scope.ioProducts = [];
            $scope.specialPrograms = [];
            $scope.selectedEntity = null;
          }
          $scope.today = moment
            .tz(scope.selectedLocation.tz)
            .format("MM/DD/YY");
          $scope.selectedLocation = null;
          $scope.$apply();
          unmask();
          alert(
            "There was an error in retrieving location data from the database."
          );
        }
      );
    };
    $scope.dateChanged = function () {
      if (!$scope.selectedLocation || !$scope.date) {
        $scope.isPastDate = false;
        return;
      }

      mask();
      if (!!$rootScope.refreshIOProductsInterval)
        clearInterval($rootScope.refreshIOProductsInterval);
      $http
        .post("/production/lots", {
          user: userService.username,
          token: userService.token,
          location: $scope.selectedLocation.code,
          timezone: $scope.selectedLocation.tz,
          date: $scope.date,
        })
        .then(
          function (res) {
            $scope.productionLots = res.data.rows;
            $rootScope.refreshIOProductsInterval = setInterval(
              refreshIOProducts,
              60000
            ); // run refreshIOProducts every minute
          },
          function (err) {
            $scope.productionLots = [];
            BootstrapDialog.show({
              title: "Production Lots",
              message:
                "Error in retrieving production lots data: " + err.data.err,
              type: "type-danger",
            });
          }
        )
        .then(function () {
          processLotData($scope);
          $scope.selectedLot = null;
          $scope.isChanged = false;
          $scope.isNew = false;
          $scope.isPastDate = moment($scope.date, "MM/DD/YY").isBefore(
            moment($scope.today, "MM/DD/YY")
          );
          unmask();
        });
    };

    $scope.getIOProductsData = function (lot, cb, isStealthMode) {
      // refresh ioProducts of the given lot with the latest info from database and run callback, if any
      if (!isStealthMode) mask();
      const p0 = $http.post("/production/lot/inputs", {
        user: userService.username,
        token: userService.token,
        id: lot.id,
      });
      const p1 = $http.post("/production/lot/outputs", {
        user: userService.username,
        token: userService.token,
        id: lot.id,
      });
      Promise.all([p0, p1]).then(
        function (res) {
          const inputs = res[0].data.rows;
          const outputs = res[1].data.rows;
          lot.ioProducts = inputs.concat(outputs);
          lot.ioProducts.forEach((ip) => {
            const ioProduct = $scope.ioProducts.find(
              (p) =>
                p.defid == lot.iodef &&
                (p.code == ip.code || p.code == ip.generic)
            );
            if (!ioProduct) {
              const product = productData.find((p) => p.code == ip.code);
              ip.name =
                product.name +
                (product.description ? " - " + product.description : "");
              return;
            }
            ip.number = ioProduct.number;
            ip.formula = ioProduct.formula;
            if (ioProduct.type == "S") {
              ip.name = ioProduct.name;
            } else {
              const product = productData.find((p) => p.code == ip.code);
              ip.name =
                product.name +
                (product.description ? " - " + product.description : "");
            }
          });
          lot.ioProducts.sort(compareIOProduct);
          if (!isStealthMode) {
            $scope.$apply();
            unmask();
          }
          if (!!cb) cb(lot.ioProducts);
        },
        function (err) {
          if (!isStealthMode) {
            $scope.$apply();
            unmask();
          }
          alert(
            "There was an error in retrieving production results from the database."
          );
        }
      );
    };

    $scope.selectLot = function (id) {
      const lot = $scope.productionLots.find((l) => l.id == id);
      $scope.selectedLot = lot;
      clearLotInfoDataFields($scope);
      $scope.lotInfo.lotNumber = lot.lotnumber;
      $scope.lotInfo.start = lot.start;
      $scope.lotInfo.end = lot.end;
      $scope.lotInfo.workshop = $scope.workshops.find(
        (w) => w.id == lot.workshop
      );
      $scope.lotInfo.ioDef = $scope.ioDefs.find((i) => i.id == lot.iodef);
      $scope.lotInfo.ioProducts = lot.ioProducts;
      if (lot.state < IN_PRODUCTION) refreshGenericInventory(lot.ioProducts);
      $scope.lotInfo.mainOutputs = lot.ioDefProducts.filter(
        (p) => p.use == "MO"
      );
      $scope.lotInfo.targetProduct = lot.targetProduct;
      $scope.lotInfo.target = lot.target.toString();
      $scope.lotInfo.unit =
        lot.unit == $scope.lotInfo.targetProduct.unit ? "*" : "";
      $scope.lotInfo.orderNumber = lot.ordernumber;
      $scope.lotInfo.tags = lot.tags;
      if (!!lot.tags) processTags($scope, lot.tags);
      $scope.lotInfo.instructions = lot.instructions;
      $scope.lotInfo.sideNote = lot.sidenote;
      $scope.lotInfo.comments = lot.comments;
      $scope.lotInfo.prepStart = lot.prepstart;
      $scope.lotInfo.prepEnd = lot.prepend;
      $scope.lotInfo.productionStart = lot.productionstart;
      $scope.lotInfo.productionEnd = lot.productionend;
      $scope.lotInfo.state = lot.state;

      initTabs();
      switch ($scope.lotInfo.state) {
        case IN_PREP:
        case IN_PRODUCTION:
          $scope.selectTab(2);
          break;
        case FINISHED:
          $scope.selectTab(3);
          break;
        default:
          break;
      }

      if (!!$scope.lotInfo.start) $scope.startChanged();
      if (!!$scope.lotInfo.end) $scope.endChanged();
      if (!!$scope.lotInfo.prepStart) $scope.startChanged("prep");
      if (!!$scope.lotInfo.prepEnd) $scope.endChanged("prep");
      if (!!$scope.lotInfo.productionStart) $scope.startChanged("production");
      if (!!$scope.lotInfo.productionEnd) $scope.endChanged("production");

      $scope.isChanged = false;
      $scope.isNew = false;
      resize(); // resize the app window height to accommodate the lot info area
    };
    $scope.selectTab = function (n) {
      let p;
      switch (n) {
        case 1:
          p = $scope.tab1Order;
          $scope.tab1Order = 1;
          $scope.showInstructions = true;
          $scope.showSideNote = false;
          $scope.showComments = false;
          if ($scope.tab2Order < p) $scope.tab2Order += 1;
          if ($scope.tab3Order < p) $scope.tab3Order += 1;
          break;
        case 2:
          p = $scope.tab2Order;
          $scope.tab2Order = 1;
          $scope.showInstructions = false;
          $scope.showSideNote = true;
          $scope.showComments = false;
          if ($scope.tab1Order < p) $scope.tab1Order += 1;
          if ($scope.tab3Order < p) $scope.tab3Order += 1;
          break;
        case 3:
          p = $scope.tab3Order;
          $scope.tab3Order = 1;
          $scope.showInstructions = false;
          $scope.showSideNote = false;
          $scope.showComments = true;
          if ($scope.tab1Order < p) $scope.tab1Order += 1;
          if ($scope.tab2Order < p) $scope.tab2Order += 1;
          break;
      }
    };
    $scope.selectGenericProduct = function (product, event) {
      if ($scope.showPopup) {
        $scope.showPopup = false;
        return;
      }

      $scope.selectedGenericProduct = product;
      $scope.showPopup = true;
      setTimeout(function () {
        /*
                const popup = $('#inventory-popup');
                $scope.popupPosition.top = event.pageY - event.offsetY + 25 - popup.outerHeight();
                $scope.popupPosition.left = event.pageX - event.offsetX - 3 - popup.outerWidth();
                */
        // hard-coded the width and height due to the delay in jquery object's capturing the angularjs's rendering results
        // so the code must be updated when related CSS is changed
        $scope.popupPosition.top =
          event.pageY -
          event.offsetY +
          25 -
          (74 +
            Math.min(34 * $scope.selectedGenericProduct.inventory.length, 205));
        $scope.popupPosition.left = event.pageX - event.offsetX - 3 - 291;
        $scope.$apply();
      }, 0);
    };
    $scope.statusCellColor = statusCellColor;
    $scope.productCellColor = productCellColor;
    $scope.productUse = productUse;
    $scope.integer = integer;
    $scope.fractional = fractional;
    $scope.totalQty = totalQty;
    $scope.ioDefChanged = function () {
      if (!!$scope.lotInfo.ioDef) {
        $scope.lotInfo.ioProducts = $scope.ioProducts
          .filter((p) => p.defid == $scope.lotInfo.ioDef.id && p.inuse)
          .sort(compareIOProduct);
        $scope.lotInfo.mainOutputs = $scope.lotInfo.ioProducts.filter(
          (p) => p.use == "MO"
        );
        refreshGenericInventory($scope.lotInfo.ioProducts);
      } else {
        $scope.lotInfo.ioProducts = [];
        $scope.lotInfo.mainOutputs = [];
      }
      $scope.lotInfo.targetProduct = null;
      $scope.targetProductChanged();
    };
    $scope.targetProductChanged = function () {
      $scope.lotInfo.target = null;
      $scope.lotInfo.unit = !!$scope.lotInfo.targetProduct ? "" : null;
      $scope.isChanged = true;
    };
    $scope.deleteTag = function (code) {
      $scope.lotInfo.tagList.splice(
        $scope.lotInfo.tagList.findIndex((t) => t.code == code),
        1
      ); // delete the selected tag
      $scope.isChanged = true;
      resize(); // resize the app window height to accommodate the lot info area
    };
    $scope.enterTag = function () {
      processTags($scope, $scope.selectedSpecialProgram.code);
      $scope.selectedSpecialProgram = null;
      $scope.isChanged = true;
      resize(); // resize the app window height to accommodate the lot info area
    };
    $scope.startChanged = function (id) {
      let element = !!id ? id + "-end-time" : "end-time";
      let options = {};
      switch (element) {
        case "end-time":
          options["minTime"] = $scope.lotInfo.start;
          break;
        case "prep-end-time":
          options["minTime"] = roundTime($scope.lotInfo.prepStart, UP);
          break;
        case "production-end-time":
          options["maxTime"] = roundTime($scope.lotInfo.productionStart, DOWN);
          $("#prep-end-time").timepicker("option", options);
          options = {};
          options["minTime"] = roundTime($scope.lotInfo.productionStart, UP);
          break;
      }
      element = "#" + element;
      $(element).timepicker("option", options);
      $scope.isChanged = true;
    };
    $scope.endChanged = function (id) {
      let element = !!id ? id + "-start-time" : "start-time";
      let options = {};
      switch (element) {
        case "start-time":
          options["maxTime"] = $scope.lotInfo.end;
          break;
        case "prep-start-time":
          options["minTime"] = roundTime($scope.lotInfo.prepEnd, UP);
          $("#production-start-time").timepicker("option", options);
          options = {};
          options["maxTime"] = roundTime($scope.lotInfo.prepEnd, DOWN);
          break;
        case "production-start-time":
          options["maxTime"] = roundTime($scope.lotInfo.productionEnd, DOWN);
          break;
      }
      element = "#" + element;
      $(element).timepicker("option", options);
      $scope.isChanged = true;
    };
    $scope.new = function () {
      $scope.isNew = true;
      $scope.selectedLot = null;
      clearLotInfoDataFields($scope);
      $scope.lotInfo.state = NEW;
      initTabs();
      $scope.isChanged = false;
      resize(); // resize the app window height to accommodate the lot info area
    };
    $scope.cancel = function () {
      const cb = function (result) {
        if (!result) return;

        clearLotInfoDataFields($scope);
        $scope.isChanged = false;
        if (!$scope.isNew) {
          const id = $scope.selectedLot.id;
          $scope.selectedLot = null;
          $scope.selectLot(id);
        } else {
          $scope.lotInfo.state = NEW;
          initTabs();
        }
        $scope.$apply();
      };

      if (!$scope.isChanged) {
        $state.go("^");
      } else {
        confirm("Are you sure you want to discard all the changes?", cb);
      }
    };
    $scope.add = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post("/production/lot/add", {
          user: userService.username,
          token: userService.token,
          location: $scope.selectedLocation.code,
          timezone: $scope.selectedLocation.tz,
          newLot: $scope.newLot,
        })
        .then(
          function (res) {
            $scope.newLot.id = res.data.rows[0].id; // id returned from INSERT
            $scope.newLot.enteredat = res.data.rows[0].enteredat; // data returned from INSERT
            $scope.newLot.enteredby =
              userService.firstName + " " + userService.lastName;
            $scope.productionLots.push($scope.newLot);
            processLotData($scope);
            $scope.selectLot($scope.newLot.id);
            setTimeout(function () {
              autoScrollTable(
                ".lots-list table tbody",
                $scope.productionLots,
                $scope.selectedLot,
                true
              );
              unmask();
              notify("The production lot data was added successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in adding the production lot data to the database. " +
                err.data.err
            );
          }
        );
    };
    $scope.update = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(`/production/lot/update/${$scope.selectedLot.id}`, {
          user: userService.username,
          token: userService.token,
          date: $scope.date,
          updatedLot: $scope.updatedLot,
        })
        .then(
          function () {
            updateSelectedLot();
            $scope.selectLot($scope.updatedLot.id);
            if ($scope.selectedLot.state == IN_PRODUCTION)
              $scope.getIOProductsData(
                $scope.selectedLot,
                updateLotInfoIOProducts,
                true
              );
            setTimeout(function () {
              autoScrollTable(
                ".lots-list table tbody",
                $scope.productionLots,
                $scope.selectedLot,
                true
              );
              unmask();
              notify("The production lot data was updated successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in updating the production lot data in the database."
            );
          }
        );
    };
    $scope.delete = function () {
      const cb = function (result) {
        if (!result) return;

        mask();
        $http
          .post(`/production/lot/delete/${$scope.selectedLot.id}`, {
            user: userService.username,
            token: userService.token,
          })
          .then(
            function () {
              $scope.productionLots.splice(
                $scope.productionLots.findIndex(
                  (l) => l.id == $scope.selectedLot.id
                ),
                1
              ); // delete a production lot
              $scope.selectedLot = null;
              clearLotInfoDataFields($scope);
              setTimeout(function () {
                scrollUpTable(".lots-list table tbody");
                unmask();
                notify("The production lot data was deleted successfully.");
              }, 0);
            },
            function (err) {
              unmask();
              alert(
                "There was an error in deleting the production lot data in the database."
              );
            }
          );
      };

      confirm(
        "Are you sure you want to delete the selected production lot?",
        cb
      );
    };
    $scope.approve = function () {
      const cb = function (result) {
        if (!result) return;

        mask();
        $http
          .post(`/production/lot/approve/${$scope.selectedLot.id}`, {
            user: userService.username,
            token: userService.token,
            timezone: $scope.selectedLocation.tz,
          })
          .then(
            function (res) {
              $scope.selectedLot.approvedat = res.data.rows[0].approvedat; // data returned from UPDATE
              $scope.selectedLot.approvedby =
                userService.firstName + " " + userService.lastName;
              $scope.selectedLot.state = APPROVED;
              $scope.selectedLot.statusName = lotStates[APPROVED].name;
              $scope.lotInfo.state = APPROVED;
              $scope.selectTab(1);
              setTimeout(function () {
                autoScrollTable(
                  ".lots-list table tbody",
                  $scope.productionLots,
                  $scope.selectedLot,
                  true
                );
                unmask();
                notify("The production lot was approved successfully.");
              }, 0);
            },
            function (err) {
              unmask();
              alert("There was an error in approving the production lot.");
            }
          );
      };

      confirm(
        "Are you sure you want to approve the selected production lot?",
        cb
      );
    };
    $scope.finish = function () {
      const cb = function (result) {
        if (!result) return;

        $scope.getIOProductsData($scope.selectedLot, calcYields);
      };

      confirm(
        "Are you sure you want to finish the selected production lot?",
        cb
      );
    };
    $scope.finishAndUpdateYields = function () {
      mask();
      $http
        .post(`/production/lot/finish/${$scope.selectedLot.id}`, {
          user: userService.username,
          token: userService.token,
          timezone: $scope.selectedLocation.tz,
          outputProducts: $scope.selectedLot.ioProducts.filter(
            (p) => p.use == "MO" || p.use == "BY"
          ),
        })
        .then(
          function (res) {
            $scope.selectedLot.finishedat = res.data.rows[0].finishedat; // data returned from UPDATE
            $scope.selectedLot.finishedby =
              userService.firstName + " " + userService.lastName;
            $scope.selectedLot.state = FINISHED;
            $scope.selectedLot.statusName = lotStates[FINISHED].name;
            $scope.lotInfo.state = FINISHED;
            $scope.lotInfo.ioProducts = $scope.selectedLot.ioProducts;
            $scope.selectTab(3);
            setTimeout(function () {
              autoScrollTable(
                ".lots-list table tbody",
                $scope.productionLots,
                $scope.selectedLot,
                true
              );
              unmask();
              notify("The production lot was finished successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert("There was an error in finishing the production lot.");
          }
        );
    };
    $scope.edit = function () {
      alert("This function is NOT implemented yet.");
    };
    $scope.close = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(`/production/lot/close/${$scope.selectedLot.id}`, {
          user: userService.username,
          token: userService.token,
          timezone: $scope.selectedLocation.tz,
          updatedLot: $scope.updatedLot,
        })
        .then(
          function (res) {
            updateSelectedLot();
            $scope.selectedLot.reviewedat = res.data.rows[0].reviewedat; // data returned from UPDATE
            $scope.selectedLot.reviewedby =
              userService.firstName + " " + userService.lastName;
            $scope.selectedLot.state = CLOSED;
            $scope.selectedLot.statusName = lotStates[CLOSED].name;
            $scope.lotInfo.state = CLOSED;
            initTabs();
            $scope.isChanged = false;
            setTimeout(function () {
              autoScrollTable(
                ".lots-list table tbody",
                $scope.productionLots,
                $scope.selectedLot,
                true
              );
              unmask();
              notify(
                "The production lot was closed successfully and is no longer editable."
              );
            }, 0);
          },
          function (err) {
            unmask();
            alert("There was an error in closing the production lot.");
          }
        );
    };
    $scope.popupPosition = {};

    if ($scope.locationData.length == 1) {
      $scope.selectedLocation = $scope.locationData[0];
      $scope.locationChanged();
    }
  };

  /*****************************************************************************************/
  const workshopConsoleController = function (
    $scope,
    $rootScope,
    $http,
    userService,
    entityData,
    locationData,
    productData
  ) {
    preprocessLocationData(
      $scope,
      locationData,
      userService.role == "SU" ? entityData : null
    );
    $scope.lotStates = lotStates;

    const workshopConsoleHeartbeat = function () {
      if (workshopConsoleHeartbeat.counter === undefined)
        workshopConsoleHeartbeat.counter = 0;
      $scope.currentTime = moment
        .tz($scope.selectedLocation.tz)
        .format("HH:mm");
      $scope.$apply();
      if (++workshopConsoleHeartbeat.counter % 120 == 0) {
        // run this every 20 min
        $http
          .post("/keepalive", {
            user: userService.username,
            token: userService.token,
          })
          .then(
            function (res) {},
            function (err) {
              console.log("keepalive failed: ");
            }
          );
      }
    };
    const refreshProductionLots = function () {
      mask();
      $http
        .post("/production/lots", {
          user: userService.username,
          token: userService.token,
          location: $scope.selectedLocation.code,
          timezone: $scope.selectedLocation.tz,
          date: $scope.date,
        })
        .then(
          function (res) {
            $scope.productionLots = res.data.rows;
            processLotData($scope);
            setTimeout(function () {
              const id = $scope.selectedLot.id;
              $scope.workshopChanged();
              $scope.selectLot(id);
              unmask();
            }, 3000); // wait 3 seconds to give enough time to read the scanning data of io products for production lots
          },
          function (err) {
            unmake();
            alert(
              "There was an error in retrieving production lots data from the database."
            );
          }
        );
    };
    const updateSelectedLot = function () {
      $scope.selectedLot.prepstart = $scope.lotInfo.prepStart;
      $scope.selectedLot.prepend = $scope.lotInfo.prepEnd;
      $scope.selectedLot.productionstart = $scope.lotInfo.productionStart;
      $scope.selectedLot.productionend = $scope.lotInfo.productionEnd;
      $scope.selectedLot.sidenote = $scope.lotInfo.sideNote;
      $scope.selectedLot.state = $scope.lotInfo.state;
      $scope.selectedLot.productionState = $scope.lotInfo.productionState;

      $scope.selectedLot.statusName = lotStates[$scope.selectedLot.state].name;
    };
    const updateLotInfoIOProducts = function (ioProducts, doNotRefresh) {
      $scope.lotInfo.ioProducts = ioProducts;
      const targetProduct = $scope.lotInfo.ioProducts.find(
        (p) => p.code == $scope.lotInfo.targetProduct.code
      );
      $scope.lotInfo.performance = 0;
      if (!!targetProduct && !!targetProduct.qty) {
        if ($scope.lotInfo.unit == "box")
          $scope.lotInfo.performance = targetProduct.numboxes;
        else $scope.lotInfo.performance = parseFloat(targetProduct.qty);
      }
      if (!doNotRefresh) $scope.$apply();

      updateProductList();
    };
    const updateProductList = function () {
      if (!$scope.productList) return;
      $scope.lotInfo.ioProducts.forEach((ip) => {
        $scope.productList.find((p) => p.code == ip.code).alreadyScannedSubbox =
          !!ip.subboxqty;
        if (!!ip.residueqty)
          $scope.productList.find((p) => p.code == ip.code).residueQty =
            ip.residueqty;
      });
    };
    const makeProductList = function () {
      $scope.productList = [];
      $scope.lotInfo.ioDefProducts.forEach((ip) => {
        if (ip.type == "S") {
          let product = angular.copy(ip);
          copyProductProperties(product);
          $scope.productList.push(product);
        } else {
          const gpId = $scope.genericProducts.find(
            (gp) => gp.code == ip.code
          ).id;
          $scope.associatedProducts.forEach((ap) => {
            if (ap.id == gpId) {
              let product = angular.copy(ip);
              product.generic = ip.code;
              product.code = ap.code;

              copyProductProperties(product, true);
              $scope.productList.push(product);
            }
          });
        }
      });
      return;

      function copyProductProperties(product, copyName) {
        const p = productData.find((p) => p.code == product.code);
        product.gtin = parseInt(p.gtin);
        product.category = p.category;
        product.quantity = p.quantity;
        product.productUnit = p.unit;
        product.gtinFormat = p.properties & mGTIN_FORMAT;
        if (!!copyName)
          product.name = p.name + (p.description ? " - " + p.description : "");
      }
    };
    // refreshGenericInventory below is the exact same as the same-named function in productionLotsController
    const refreshGenericInventory = function (ioProducts) {
      ioProducts.forEach((p) => {
        if (p.type != "G") return;
        if (!p.inventory || new Date() - p.inventoryRefreshedAt > 300000) {
          // no inventory data or data older than 5 min
          $http
            .post("/production/genericproduct/inventory", {
              user: userService.username,
              token: userService.token,
              entity: $scope.selectedLocation.entity,
              location: $scope.selectedLocation.code,
              product: p.code,
            })
            .then(
              function (res) {
                p.inventory = res.data.rows;
                p.inventoryRefreshedAt = new Date();
              },
              function (err) {
                p.inventory = null;
                p.inventoryRefreshedAt = null;
              }
            );
        }
      });
    };
    const addToSummary = function () {
      let product = $scope.summaryOfScan.find(
        (p) => p.gtin == $scope.scanner.gtin
      );

      if (!!product) {
        product.qty = dec2(
          product.qty + parseFloat($scope.scanner.qty) * $scope.scanner.numBoxes
        );
        product.inventoryQty = dec2(
          product.inventoryQty +
            parseFloat($scope.scanner.itemQty) * $scope.scanner.numBoxes
        );
        product.numBoxes += $scope.scanner.numBoxes;
      } else {
        let p = angular.copy($scope.scanner.product);
        p.type = "S"; // summary of scan
        p.id = $scope.summaryOfScanId++; // overwrite id with a new unique id in order to use autoScrollTable()
        p.qty = dec2(parseFloat($scope.scanner.qty) * $scope.scanner.numBoxes);
        p.inventoryQty = dec2(
          parseFloat($scope.scanner.itemQty) * $scope.scanner.numBoxes
        ); // qty in the same unit as the numbers in the inventory table
        p.numBoxes = $scope.scanner.numBoxes;
        p.subboxQty = 0;
        p.subbox0 = null;
        p.numSubboxes = 0;
        $scope.summaryOfScan.push(p);
      }
      $scope.summaryOfScan.sort(compareIOProduct);
    };
    const subtractFromSummary = function (item) {
      let product = $scope.summaryOfScan.find((p) => p.gtin == item.gtin);

      if (!!item.subboxQty) {
        // in case the item is a residual box
        product.subboxQty = dec2(product.subboxQty - item.subboxQty);
        product.numSubboxes -= item.subboxQty / item.qty;
        if (product.subboxQty == 0) product.numSubboxes = 0;
      } else {
        product.qty = dec2(product.qty - parseFloat(item.qty) * item.numBoxes);
        product.inventoryQty = dec2(
          product.inventoryQty - parseFloat(item.itemQty) * item.numBoxes
        );
        product.numBoxes -= item.numBoxes;
        if (!product.subboxQty && (product.qty == 0 || product.numBoxes == 0)) {
          $scope.summaryOfScan.splice(
            $scope.summaryOfScan.findIndex((p) => p.id == product.id),
            1
          );
        }
      }
    };
    const adjustSummary = function (item) {
      let product = $scope.summaryOfScan.find((p) => p.gtin == item.gtin);

      product.qty = dec2(product.qty - parseFloat(item.qty));
      product.inventoryQty = dec2(
        product.inventoryQty - parseFloat(item.itemQty)
      );
      product.numBoxes--;
      product.subboxQty = dec2(product.subboxQty + item.subboxQty);
      product.subbox0 = parseFloat(item.qty);
      product.numSubboxes += item.subboxQty / item.qty;
    };
    const focusBarcodeInput = function () {
      $("#barcode-input").focus();
    };
    const focusNumBoxesInput = function () {
      $("#num-boxes-input").focus();
    };
    const focusResidueQtyInput = function () {
      $(".residual-items-list table tbody tr.selected input").focus();
    };
    const initScanner = function () {
      $scope.scanner = {
        id: null,
        barcode: "",
        gtin: null,
        quantity: null,
        unit: null,
        isShortBarcode: false,
        numBoxes: 1,
        qty: null, // adjusted qty to be used in updating ioProducts
        itemQty: null, // quantity that should appear in the item record in the items table
        product: null,
        err: null,
        checked: false,
      };
    };
    const initScanningData = function () {
      $scope.scannedItems = [];
      $scope.summaryOfScan = [];
      $scope.scannedItemsId = 0;
      $scope.summaryOfScanId = 0;
      $scope.numChecked = 0;
    };
    const initResidualScanningData = function () {
      $scope.scannedResidualItems = [];
      $scope.scannedResidualItemsId = 0;
      $scope.numResidualChecked = 0;
      $scope.allResidueQtyEntered = false;
    };
    let errorSound = new Audio("/audio/error.mp3");
    let okSound = new Audio("/audio/success.mp3");
    const beepOK = function () {
      okSound.src = "/audio/success.mp3"; // Without this line, Safari plays nothing. It always downloads the sound file again.
      okSound.play();
    };
    const beepError = function () {
      errorSound.src = "/audio/error.mp3"; // Without this line, Safari plays nothing. It always downloads the sound file again.
      errorSound.play();
    };
    const convertQuantity = function () {
      if ($scope.scanner.unit == $scope.scanner.product.unit) {
        // no conversion needed
        $scope.scanner.qty = parseFloat($scope.scanner.quantity).toFixed(2);
      }
      if ($scope.scanner.unit == $scope.scanner.product.productUnit) {
        // no conversion needed
        $scope.scanner.itemQty = parseFloat($scope.scanner.quantity).toFixed(2);
      }
      if (!!$scope.scanner.qty && !!$scope.scanner.itemQty) return;

      let qty = parseFloat($scope.scanner.quantity);
      let category;
      switch ($scope.scanner.unit) {
        case "kg":
          qty *= 2.20462;
          category = "weight";
          break;
        case "oz":
          qty *= 0.0625;
          category = "weight";
          break;
        case "lbs":
          category = "weight";
          break;
        case "gal":
          qty *= 3.78541;
          category = "volume";
          break;
        case "litre":
          category = "volume";
          break;
        default:
          break;
      }
      let qty2 = qty;
      if ($scope.scanner.unit != $scope.scanner.product.unit) {
        switch ($scope.scanner.product.unit) {
          case "kg":
            qty *= 0.453592;
            checkWeight();
            break;
          case "oz":
            qty *= 16;
            checkWeight();
            break;
          case "lbs":
            checkWeight();
            break;
          case "gal":
            qty *= 0.264172;
            checkVolume();
          case "litre":
            checkVolume();
            break;
          default:
            $scope.scanner.err = "Incompatible unit";
            break;
        }
        $scope.scanner.qty = qty.toFixed(2);
      }
      if ($scope.scanner.unit != $scope.scanner.product.productUnit) {
        switch ($scope.scanner.product.productUnit) {
          case "kg":
            qty2 *= 0.453592;
            break;
          case "oz":
            qty2 *= 16;
            break;
          case "gal":
            qty2 *= 0.264172;
            break;
          default:
            break;
        }
        $scope.scanner.itemQty = qty2.toFixed(2);
      }
      return;

      function checkWeight() {
        if (category != "weight") $scope.scanner.err = "Incompatible unit";
      }
      function checkVolume() {
        if (category != "volume") $scope.scanner.err = "Incompatible unit";
      }
    };
    const convertResidueQty = function (item) {
      item.residueQty = dec2(item.residueQty);
      if (item.product.unit == item.product.productUnit) {
        // no conversion needed
        item.residueItemQty = item.residueQty;
        return;
      }

      let qty = item.residueQty;
      switch (item.product.unit) {
        case "kg":
          qty *= 2.20462;
          break;
        case "oz":
          qty *= 0.0625;
          break;
        case "lbs":
          break;
        default:
          break;
      }
      switch (item.product.productUnit) {
        case "kg":
          qty *= 0.453592;
          break;
        case "oz":
          qty *= 16;
          break;
        default:
          break;
      }
      item.residueItemQty = qty;
      return;
    };

    const convertSubboxQty = function (item) {
      if (item.product.unit == item.product.productUnit) {
        // no conversion needed
        item.subboxQty = item.subboxItemQty;
        return;
      }

      let qty = item.subboxItemQty;
      switch (item.product.productUnit) {
        case "kg":
          qty *= 2.20462;
          break;
        case "oz":
          qty *= 0.0625;
          break;
        case "lbs":
          break;
        default:
          break;
      }
      switch (item.product.unit) {
        case "kg":
          qty *= 0.453592;
          break;
        case "oz":
          qty *= 16;
          break;
        default:
          break;
      }
      item.subboxQty = dec2(qty);

      return;
    };

    $scope.locationChanged = function () {
      if (!$scope.selectedLocation) {
        $scope.workshops = [];
        $scope.factoryData = {};
        $selectedWorkshop = null;
        $scope.workshopChanged();
        return;
      }

      mask();
      $scope.today = moment
        .tz($scope.selectedLocation.tz)
        .format("ddd. MM/DD.");
      $scope.date = moment.tz($scope.selectedLocation.tz).format("MM/DD/YY");
      $scope.isoDate = moment
        .tz($scope.selectedLocation.tz)
        .format("YYYY-MM-DD");
      const p0 = $http.post("/production/workshops/all", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
      });
      const p1 = $http.post("/production/location/factory", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
      });
      const p2 = $http.post("/production/lots", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
        timezone: $scope.selectedLocation.tz,
        date: $scope.date,
      });
      let p = [p0, p1, p2];

      if (
        !$scope.selectedEntity ||
        $scope.selectedEntity != $scope.selectedLocation.entity
      ) {
        const p3 = $http.post("/production/iodefinitions/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p3);
        const p4 = $http.post("/production/ioproducts/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p4);
        const p5 = $http.post("/production/genericproducts", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p5);
        const p6 = $http.post("/production/associatedproducts", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p6);
        const p7 = $http.post("/production/specialprograms/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p7);
      }
      Promise.all(p).then(
        function (res) {
          $scope.workshops = res[0].data.rows;
          $scope.factoryData = res[1].data.rows[0];
          $scope.productionLots = res[2].data.rows;
          if (p.length > 3) {
            $scope.ioDefs = res[3].data.rows;
            $scope.ioProducts = res[4].data.rows;
            $scope.genericProducts = res[5].data.rows;
            $scope.associatedProducts = res[6].data.rows;
            $scope.specialPrograms = res[7].data.rows;
            $scope.selectedEntity = $scope.selectedLocation.entity;
          }
          processLotData($scope);
          $scope.selectedWorkshop = null;
          $scope.workshopChanged();
          $scope.$apply();
          unmask();
        },
        function (err) {
          $scope.workshops = [];
          $scope.factoryData = {};
          $scope.productionLots = [];
          if (p.length > 3) {
            $scope.ioDefs = [];
            $scope.ioProducts = [];
            $scope.genericProducts = [];
            $scope.associatedProducts = [];
            $scope.selectedEntity = null;
          }
          $scope.selectedWorkshop = null;
          $scope.workshopChanged();
          $scope.$apply();
          unmask();
          alert(
            "There was an error in retrieving production lots data from the database."
          );
        }
      );
    };
    $scope.workshopChanged = function () {
      $scope.lotsForWorkshop = !!$scope.selectedWorkshop
        ? $scope.productionLots.filter(
            (l) => l.workshop == $scope.selectedWorkshop.id
          )
        : [];
      $scope.selectedLot = null;
    };
    // getIOProductsData below is the exact same as the same-named function in productionLotsController
    $scope.getIOProductsData = function (lot, cb, isStealthMode) {
      // refresh ioProducts of the given lot with the latest info from database and run callback, if any
      if (!isStealthMode) mask();
      const p0 = $http.post("/production/lot/inputs", {
        user: userService.username,
        token: userService.token,
        id: lot.id,
      });
      const p1 = $http.post("/production/lot/outputs", {
        user: userService.username,
        token: userService.token,
        id: lot.id,
      });
      Promise.all([p0, p1]).then(
        function (res) {
          const inputs = res[0].data.rows;
          const outputs = res[1].data.rows;
          lot.ioProducts = inputs.concat(outputs);
          lot.ioProducts.forEach((ip) => {
            const ioProduct = $scope.ioProducts.find(
              (p) =>
                p.defid == lot.iodef &&
                (p.code == ip.code || p.code == ip.generic)
            );
            if (!ioProduct) {
              const product = productData.find((p) => p.code == ip.code);
              ip.name =
                product.name +
                (product.description ? " - " + product.description : "");
              return;
            }
            ip.number = ioProduct.number;
            ip.formula = ioProduct.formula;
            if (ioProduct.type == "S") {
              ip.name = ioProduct.name;
            } else {
              const product = productData.find((p) => p.code == ip.code);
              ip.name =
                product.name +
                (product.description ? " - " + product.description : "");
            }
          });
          lot.ioProducts.sort(compareIOProduct);
          if (!isStealthMode) {
            $scope.$apply();
            unmask();
          }
          if (!!cb) cb(lot.ioProducts);
        },
        function (err) {
          if (!isStealthMode) {
            $scope.$apply();
            unmask();
          }
          alert(
            "There was an error in retrieving production results from the database."
          );
        }
      );
    };
    $scope.statusCellColor = statusCellColor;
    $scope.productCellColor = productCellColor;
    $scope.productUse = productUse;
    $scope.integer = function (product) {
      return !!product.subboxQty
        ? Math.floor(product.numBoxes + product.numSubboxes)
        : product.numBoxes;
    };
    $scope.fractional = function (product) {
      if (product.type == "S")
        // summary of scan
        return !!product.subboxQty
          ? "." +
              (product.numBoxes + product.numSubboxes).toFixed(1).split(".")[1]
          : " ";
      // input materials in ioProducts
      else
        return !!product.subboxqty
          ? "." + (product.subboxqty / product.subbox0).toFixed(1).split(".")[1]
          : " ";
    };
    $scope.totalInputQty = function (product) {
      if (product.qty === undefined) return null;
      else
        return (
          parseFloat(product.qty) +
          parseFloat(!!product.subboxqty ? product.subboxqty : "0")
        ).toFixed(2);
    };
    $scope.selectLot = function (id) {
      const lot = $scope.lotsForWorkshop.find((l) => l.id == id);
      const state = lot.state;
      if (state != APPROVED && state != IN_PREP && state != IN_PRODUCTION)
        return;

      $scope.selectedLot = lot;
      $scope.lotInfo = {};
      $scope.lotInfo.lotNumber = lot.lotnumber;
      $scope.lotInfo.start = lot.start;
      $scope.lotInfo.end = lot.end;
      $scope.lotInfo.workshop = $scope.workshops.find(
        (w) => w.id == lot.workshop
      );
      $scope.lotInfo.ioDef = $scope.ioDefs.find((i) => i.id == lot.iodef);
      $scope.lotInfo.ioDefProducts = lot.ioDefProducts;
      refreshGenericInventory(lot.ioDefProducts);
      $scope.lotInfo.ioProducts = lot.ioProducts;
      $scope.lotInfo.targetProduct = lot.targetProduct;
      $scope.lotInfo.target = lot.target;
      $scope.lotInfo.tagList = [];
      if (!!lot.tags) processTags($scope, lot.tags);
      $scope.lotInfo.unit = lot.unit;
      $scope.lotInfo.tags = lot.tags;
      $scope.lotInfo.orderNumber = lot.ordernumber;
      $scope.lotInfo.instructions = lot.instructions;
      $scope.lotInfo.sideNote = lot.sidenote;
      $scope.lotInfo.comments = lot.comments;
      $scope.lotInfo.prepStart = lot.prepstart;
      $scope.lotInfo.prepEnd = lot.prepend;
      $scope.lotInfo.productionStart = lot.productionstart;
      $scope.lotInfo.productionEnd = lot.productionend;
      $scope.lotInfo.state = lot.state;
      $scope.lotInfo.productionState = lot.productionState;
      if (!!lot.ioProducts) updateLotInfoIOProducts(lot.ioProducts, true);
      $scope.productList = null;
    };
    $scope.enter = function () {
      $scope.currentTime = moment
        .tz($scope.selectedLocation.tz)
        .format("HH:mm");
      $rootScope.workshopConsoleHeartbeatInterval = setInterval(
        workshopConsoleHeartbeat,
        10000
      ); // run workshopConsoleHeartbeat every 10 seconds
      $scope.isTimeValid = false;
      $scope.consoleVisible = true;
      $scope.ioProductsVisible = true;
      $scope.productionLotInfoVisible = false;
      $scope.addNoteVisible = false;
      $scope.scanBarcodesVisible = false;
      $scope.scannerMode = INPUT_AND_OUTPUT;
      $scope.isSideNoteChanged = false;
      if (!$scope.lotInfo.ioProducts)
        // just in case
        updateLotInfoIOProducts($scope.selectedLot.ioProducts, true);
      makeProductList();
      initScanningData();
      initResidualScanningData();
    };
    $scope.closeConsole = function () {
      if (
        $scope.scannedItems.length > 0 ||
        $scope.scannedResidualItems.length > 0
      ) {
        const cb = function (result) {
          if (!result) {
            setTimeout(focusBarcodeInput, 0);
            return;
          }

          close();
          $scope.$apply();
        };

        confirm(
          "Are you sure you really want to close the console? Once it is closed, all unprocessed barcode data will be lost",
          cb
        );
      } else {
        close();
      }
      return;

      function close() {
        $scope.productList = null;
        refreshProductionLots();
        clearInterval($rootScope.workshopConsoleHeartbeatInterval);
        delete $rootScope.workshopConsoleHeartbeatInterval;
        $scope.consoleVisible = false;
      }
    };
    $scope.timeChanged = function (time) {
      function checkTime() {
        if (!time) return false;
        if (time.length != 5) return false;
        const t = time.split(":");
        if (t[0].length != 2) return false;
        if (!t[0].match(/[01][0-9]$/)) {
          if (!t[0].match(/2[0-3]$/)) return false;
        }
        if (t[1].length != 2) return false;
        if (!t[1].match(/[0-5][0-9]$/)) return false;
        return true;
      }

      $scope.isTimeValid = checkTime();
    };
    $scope.timestamp = function (timeVarName) {
      const currentTime = moment.tz($scope.selectedLocation.tz).format("HH:mm");
      eval(`$scope.lotInfo.${timeVarName} = currentTime`);
      $scope.isTimeValid = true;
    };
    $scope.confirm = function (timeVarName) {
      const time = eval(`$scope.lotInfo.${timeVarName}`);
      if (!checkTime()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(`/production/lot/update/time/${$scope.selectedLot.id}`, {
          user: userService.username,
          token: userService.token,
          field: timeVarName.toLowerCase(),
          value: time,
        })
        .then(
          function () {
            $scope.lotInfo.productionState++;
            $scope.isTimeValid = false;
            if ($scope.lotInfo.productionState == PREP_STARTED)
              $scope.lotInfo.state = IN_PREP;
            else if ($scope.lotInfo.productionState == PRODUCTION_STARTED)
              $scope.lotInfo.state = IN_PRODUCTION;
            updateSelectedLot();
            unmask();
            if ($scope.selectedLot.state == IN_PRODUCTION)
              $scope.getIOProductsData(
                $scope.selectedLot,
                updateLotInfoIOProducts,
                true
              );
          },
          function (err) {
            unmask();
            alert("There was an error in storing the time in the database.");
          }
        );

      function checkTime() {
        const minTime = !!$scope.factoryData.workshopsopen
          ? $scope.factoryData.workshopsopen
          : "00:00";
        const maxTime = !!$scope.factoryData.workshopsclose
          ? $scope.factoryData.workshopsclose
          : "24:00";
        const currentTime = moment
          .tz($scope.selectedLocation.tz)
          .format("HH:mm");

        if (maxTime.localeCompare(time) < 0) {
          $scope.errMsg = "Time is out of range.";
          return false;
        }
        if (currentTime.localeCompare(time) < 0) {
          $scope.errMsg = "Time cannot be set in advance.";
          return false;
        }
        switch ($scope.lotInfo.productionState) {
          case WORKSHOP_READY:
            if (minTime.localeCompare(time) > 0) {
              $scope.errMsg = "Prep cannot start before the workshop opens.";
              return false;
            }
            break;
          case PREP_STARTED:
            if ($scope.lotInfo.prepStart.localeCompare(time) > 0) {
              $scope.errMsg = "Prep cannot end before it is started.";
              return false;
            }
            break;
          case PREP_ENDED:
            if ($scope.lotInfo.prepEnd.localeCompare(time) > 0) {
              $scope.errMsg = "Production cannot start before prep ends.";
              return false;
            }
            break;
          case PRODUCTION_STARTED:
            if ($scope.lotInfo.productionStart.localeCompare(time) > 0) {
              $scope.errMsg = "Production cannot end before it is started.";
              return false;
            }
            break;
          default:
            break;
        }
        if (!!$scope.factoryData.isoverlapallowed)
          // production lots are allowed to overlap with each other
          return true;

        for (const l of $scope.lotsForWorkshop) {
          if (l.id == $scope.selectedLot.id || !l.prepstart) continue;
          const end = !!l.productionend ? l.productionend : maxTime;
          if (
            l.prepstart.localeCompare(time) < 0 &&
            end.localeCompare(time) > 0
          ) {
            $scope.errMsg =
              "Prep time and/or production time are in conflict with other production lots.";
            return false;
          }
        }
        return true;
      }
    };
    $scope.selectGenericProduct = function (product, event) {
      if ($scope.showPopup) {
        $scope.showPopup = false;
        return;
      }

      $scope.selectedGenericProduct = product;
      $scope.showPopup = true;
      setTimeout(function () {
        /*
                const popup = $('#inventory-popup');
                $scope.popupPosition.top = event.pageY - 100 - event.offsetY + 25 - popup.outerHeight();    // because the container, workshop-console, is positioned 'absolute' at top = 100, left = 50
                $scope.popupPosition.left = event.pageX - 50 - event.offsetX - 3 - popup.outerWidth();
                */
        // hard-coded the width and height due to the delay in jquery object's capturing the angularjs's rendering results
        // so the code must be updated when related CSS is changed
        $scope.popupPosition.top =
          event.pageY -
          100 -
          event.offsetY +
          25 -
          (74 +
            Math.min(34 * $scope.selectedGenericProduct.inventory.length, 205));
        $scope.popupPosition.left = event.pageX - 50 - event.offsetX - 3 - 291;
        $scope.$apply();
      }, 0);
    };
    $scope.showLotInfo = function () {
      $scope.ioProductsVisible = false;
      $scope.productionLotInfoVisible = true;
      $scope.addNoteVisible = false;
      $scope.scanBarcodesVisible = false;
    };
    $scope.showAddNote = function () {
      $scope.ioProductsVisible = false;
      $scope.productionLotInfoVisible = false;
      $scope.addNoteVisible = true;
      $scope.scanBarcodesVisible = false;
    };
    $scope.showScanBarcodes = function () {
      $scope.ioProductsVisible = false;
      $scope.productionLotInfoVisible = false;
      $scope.addNoteVisible = false;
      $scope.scanBarcodesVisible = true;
      initScanner();
      setTimeout(focusBarcodeInput, 100);
    };
    $scope.closeInfoPanel = function () {
      $scope.ioProductsVisible = true;
      $scope.productionLotInfoVisible = false;
      $scope.addNoteVisible = false;
      $scope.scanBarcodesVisible = false;
    };
    $scope.finish = function () {
      const cb = function (result) {
        if (!result) return;

        calcYields($scope, $scope.selectedLot.ioProducts);
      };

      confirm(
        "Do you want to finish the selected production lot? Please make sure that all input materials and output products have been scanned.",
        cb
      );
    };
    $scope.finishAndUpdateYields = function () {
      mask();
      $http
        .post(`/production/lot/finish/${$scope.selectedLot.id}`, {
          user: userService.username,
          token: userService.token,
          timezone: $scope.selectedLocation.tz,
          outputProducts: $scope.selectedLot.ioProducts.filter(
            (p) => p.use == "MO" || p.use == "BY"
          ),
        })
        .then(
          function (res) {
            $scope.selectedLot.finishedat = res.data.rows[0].finishedat; // data returned from UPDATE
            $scope.selectedLot.finishedby =
              userService.firstName + " " + userService.lastName;
            $scope.selectedLot.state = FINISHED;
            $scope.selectedLot.productionState = IO_SCANS_FINISHED;
            $scope.selectedLot.statusName = lotStates[FINISHED].name;
            $scope.lotInfo.state = FINISHED;
            $scope.lotInfo.productionState = IO_SCANS_FINISHED;
            $scope.lotInfo.ioProducts = $scope.selectedLot.ioProducts;
            unmask();
            notify("The production lot was finished successfully.");
          },
          function (err) {
            unmask();
            alert("There was an error in finishing the production lot.");
          }
        );
    };
    $scope.updateNote = function () {
      if ($scope.lotInfo.sideNote !== null) {
        $scope.lotInfo.sideNote = $scope.lotInfo.sideNote.trim();
        if ($scope.lotInfo.sideNote.length == 0) $scope.lotInfo.sideNote = null;
      }
      if ($scope.lotInfo.sideNote == $scope.selectedLot.sidenote) {
        $scope.isSideNoteChanged = false;
        return;
      }

      mask();
      $http
        .post(`/production/lot/update/note/${$scope.selectedLot.id}`, {
          user: userService.username,
          token: userService.token,
          note: $scope.lotInfo.sideNote,
        })
        .then(
          function () {
            updateSelectedLot();
            $scope.isSideNoteChanged = false;
            unmask();
            notify("The side note was added/updated successfully.");
          },
          function (err) {
            unmask();
            alert(
              "There was an error in storing the side note in the database."
            );
          }
        );
    };
    $scope.modeChanged = function () {
      focusBarcodeInput();
    };
    $scope.parseBarcode = function () {
      if ($scope.scanner.barcode.length < 12) {
        $scope.scanner.err = "Invalid barcode";
      } else if ($scope.scanner.barcode.length < 14) {
        if ($scope.scannerMode == RESIDUAL_INPUT) {
          $scope.scanner.err = "Invalid barcode";
        } else if (!/^[0-9]+$/.test($scope.scanner.barcode)) {
          $scope.scanner.err = "Invalid barcode";
        } else {
          if ($scope.scanner.barcode.length == 12)
            $scope.scanner.gtinFormat = UPC;
          else $scope.scanner.gtinFormat = EAN;
          $scope.scanner.isShortBarcode = true;
          $scope.scanner.gtin = parseInt($scope.scanner.barcode);
          setTimeout(focusNumBoxesInput, 0);
        }
      } else {
        let barcode = $scope.scanner.barcode;
        let data;

        $scope.scanner.gtinFormat = GTIN;
        while (barcode.length > 0) {
          const id = barcode.substring(0, 2);
          const gs1 = GS1_128.find((g) => g.id == id);
          if (!gs1) {
            $scope.scanner.err = `Unsupported GS1-128 application identifier: ${id}`;
            break;
          }
          if (barcode.length < 2 + gs1.length) {
            $scope.scanner.err = "GS1-128 barcode too short";
            break;
          }
          data = barcode.substring(
            2,
            gs1.length > 0 ? 2 + gs1.length : undefined
          );
          gs1.handler(data, $scope.scanner);
          if (!!$scope.scanner.err) break;
          barcode = barcode.substring(2 + data.length);
        }
      }

      if (
        !$scope.scanner.err &&
        !$scope.scanner.isShortBarcode &&
        (!$scope.scanner.gtin ||
          !$scope.scanner.quantity ||
          !$scope.scanner.unit)
      )
        $scope.scanner.err = "Invalid GS1-128 barcode";

      if (!$scope.scanner.err) {
        $scope.scanner.product = $scope.productList.find(
          (p) => p.gtin == $scope.scanner.gtin
        );
        if (
          !$scope.scanner.product ||
          $scope.scanner.gtinFormat != $scope.scanner.product.gtinFormat
        ) {
          switch ($scope.scanner.gtinFormat) {
            case GTIN:
              $scope.scanner.err = "Unknown GTIN";
              break;
            case UPC:
              $scope.scanner.err = "Unknown UPC";
              break;
            case EAN:
              $scope.scanner.err = "Unknown EAN";
              break;
          }
        } else if ($scope.scannerMode == RESIDUAL_INPUT) {
          if (
            $scope.scanner.product.use == "MO" ||
            $scope.scanner.product.use == "BY"
          )
            $scope.scanner.err =
              "Residual items not allowed for an output product";
          else if (!!$scope.scanner.product.residueQty)
            $scope.scanner.err =
              "Residual item of the input product already scanned";
          else if (
            !!$scope.scannedResidualItems.find(
              (i) => i.barcode == $scope.scanner.barcode
            )
          )
            $scope.scanner.err = "Duplicate barcode";
          else if (
            !!$scope.scannedResidualItems.find(
              (i) => i.product.code == $scope.scanner.product.code
            )
          )
            $scope.scanner.err =
              "Only one residual item allowed for an input product";
        } else {
          if ($scope.scanner.isShortBarcode) {
            $scope.scanner.quantity = $scope.scanner.product.quantity;
            $scope.scanner.unit = $scope.scanner.product.productUnit;
          } else {
            if (
              !!$scope.scannedItems.find(
                (i) => i.barcode == $scope.scanner.barcode
              )
            )
              $scope.scanner.err = "Duplicate barcode";
          }
        }
      }

      if (!$scope.scanner.err) convertQuantity();

      $scope.processBarcode();
    };
    $scope.processBarcode = function (isShort) {
      if (!!$scope.scanner.err) {
        beepError();
        alert($scope.scanner.err, function () {
          initScanner();
          setTimeout(focusBarcodeInput, 0);
          $scope.$apply();
        });
      } else if (!!isShort == $scope.scanner.isShortBarcode) {
        beepOK();
        if ($scope.scannerMode == INPUT_AND_OUTPUT) {
          $scope.scanner.id = $scope.scannedItemsId++; // add id in order to use autoScrollTable()
          $scope.scannedItems.push($scope.scanner);
          addToSummary();
          initScanner();
          setTimeout(function () {
            autoScrollTable(
              ".scanned-items-list table tbody",
              $scope.scannedItems,
              $scope.scannedItems[$scope.scannedItems.length - 1],
              true
            );
            autoScrollTable(
              ".summary-of-scanning table tbody",
              $scope.summaryOfScan,
              $scope.summaryOfScan[$scope.summaryOfScan.length - 1],
              true
            );
            focusBarcodeInput();
          }, 0);
        } else {
          $scope.scanner.id = $scope.scannedResidualItemsId++; // add id in order to use autoScrollTable()
          $scope.scannedResidualItems.push($scope.scanner);
          $scope.allResidueQtyEntered = false;
          initScanner();
          setTimeout(function () {
            autoScrollTable(
              ".residual-items-list table tbody",
              $scope.scannedResidualItems,
              $scope.scannedResidualItems[
                $scope.scannedResidualItems.length - 1
              ],
              true
            );
            focusBarcodeInput();
          }, 0);
        }
      }
    };
    $scope.toggleChecked = function (item) {
      if (!!item.err) return;

      item.checked = !item.checked;
      if (item.checked) {
        if ($scope.scannerMode == INPUT_AND_OUTPUT) $scope.numChecked++;
        else $scope.numResidualChecked++;
      } else {
        if ($scope.scannerMode == INPUT_AND_OUTPUT) $scope.numChecked--;
        else $scope.numResidualChecked--;
      }
    };
    $scope.cancelScan = function () {
      const cb = function (result) {
        setTimeout(focusBarcodeInput, 0);
        if (!result) return;

        initScanningData();
        $scope.$apply();
      };

      confirm(
        "Are you sure you really want to discard all unprocessed barcode data?",
        cb
      );
    };
    $scope.deleteScanData = function () {
      const cb = function (result) {
        setTimeout(focusBarcodeInput, 0);
        if (!result) return;

        $scope.scannedItems.forEach((i) => {
          if (i.checked) {
            subtractFromSummary(i);
            $scope.numChecked--;
          }
        });
        $scope.scannedItems = $scope.scannedItems.filter((i) => !i.checked);
        $scope.$apply();
      };

      confirm(
        "Are you sure you want to delete all barcode data marked with a trash can icon?",
        cb
      );
    };
    $scope.storeScanData = function () {
      mask();
      $http
        .post("/production/lot/check/items/", {
          user: userService.username,
          token: userService.token,
          location: $scope.selectedLocation.code,
          items: $scope.scannedItems.map((i) => {
            return {
              id: i.id,
              barcode: i.barcode,
              isShortBarcode: i.isShortBarcode,
              product: i.product.code,
              use: i.product.use,
              qty: i.itemQty,
            };
          }),
        })
        .then(
          function (res) {
            let subboxError = false;
            res.data.forEach((r) => {
              if (!!r.err) {
                const errItem = $scope.scannedItems.find((i) => i.id == r.id);
                errItem.remark = r.err;
                if (!errItem.subboxQty) {
                  errItem.subboxItemQty = r.subboxqty;
                  convertSubboxQty(errItem);
                  adjustSummary(errItem);
                }
                if (errItem.product.alreadyScannedSubbox) {
                  errItem.checked = true;
                  $scope.numChecked++;
                  subboxError = true;
                }
                if (
                  !!res.data.find(
                    (rr) => rr.product == r.product && rr.id != r.id
                  )
                ) {
                  subboxError = true;
                }
              }
            });
            if (subboxError) {
              unmask();
              alert(
                "Only one residual item can be scanned as input for each input product. Please check the list, clear the issues, and try again."
              );
            } else {
              store();
            }
          },
          function (err) {
            if (!!err.data) {
              err.data.forEach((r) => {
                if (!!r.err) {
                  const errItem = $scope.scannedItems.find((i) => i.id == r.id);
                  errItem.err = r.err;
                  errItem.checked = true;
                  $scope.numChecked++;
                }
              });
            }
            unmask();
            alert(
              "There are items that have caused problems in storing in the database. Please check the list, clear the issues, and try again."
            );
          }
        );
      return;

      function store() {
        $http
          .post("/production/lot/store/items/", {
            user: userService.username,
            token: userService.token,
            location: $scope.selectedLocation.code,
            date: $scope.isoDate,
            lotid: $scope.selectedLot.id,
            items: $scope.scannedItems.map((i) => {
              return {
                barcode: i.barcode,
                isShortBarcode: i.isShortBarcode,
                code: i.product.code,
                use: i.product.use,
                qty: i.itemQty,
                subboxQty: i.subboxQty,
                unit: i.product.productUnit,
              };
            }),
            summary: $scope.summaryOfScan.map((p) => {
              return {
                code: p.code,
                generic: p.generic,
                use: p.use,
                unit: p.unit,
                gtinFormat: p.gtinFormat,
                qty: p.qty,
                inventoryQty: p.inventoryQty,
                numBoxes: p.numBoxes,
                subboxQty: p.subboxQty,
                subbox0: subbox0(p),
              };
            }),
          })
          .then(
            function (res) {
              $scope.getIOProductsData(
                $scope.selectedLot,
                updateLotInfoIOProducts,
                true
              );
              initScanningData();
              unmask();
              notify("The scan data was stored successfully.");
            },
            function (err) {
              unmask();
              alert(
                "There was an error in storing the scan data in the database."
              );
            }
          );
      }

      function subbox0(product) {
        const subboxItem = $scope.scannedItems.find(
          (i) => i.product.code == product.code && !!i.subboxQty
        );
        return !!subboxItem ? parseFloat(subboxItem.qty) : null;
      }
    };
    $scope.processResidueQty = function (item, isBlurred) {
      if (!item.changed) return;

      if ($scope.processResidueQty.running === undefined)
        $scope.processResidueQty.running = true;
      else if ($scope.processResidueQty.running) return;
      else $scope.processResidueQty.running = true;

      $scope.selectedResidualItem = item;
      if (item.residueQty === undefined || item.residueQty === null) {
        $scope.allResidueQtyEntered = false;
        item.residueQtyOK = false;
      } else {
        if (parseFloat(item.qty) < item.residueQty) {
          processError(
            "Residue qty too large",
            "Residue quantity cannot be greater than the original quantity of the item."
          );
          return;
        } else if (item.residueQty == 0) {
          processError(
            "Residue qty zero",
            "Residue quantity must be a positive number."
          );
          return;
        } else {
          convertResidueQty(item);
          if (item.checked) {
            item.checked = false;
            item.err = null;
            $scope.numResidualChecked--;
          }
          item.residueQtyOK = true;
          $scope.allResidueQtyEntered = !$scope.scannedResidualItems.find(
            (i) => !i.residueQtyOK
          );
        }
      }
      if (!isBlurred) focusBarcodeInput();
      turnOffRunningFlag();
      return;

      function processError(errMsg, alertMsg) {
        beepError();
        item.err = errMsg;
        if (!item.checked) {
          item.checked = true;
          $scope.numResidualChecked++;
        }
        item.residueQtyOK = false;
        $scope.allResidueQtyEntered = false;
        item.changed = false;
        alert(alertMsg, function () {
          setTimeout(focusResidueQtyInput, 0);
          turnOffRunningFlag();
        });
      }

      function turnOffRunningFlag() {
        setTimeout(function () {
          $scope.processResidueQty.running = false;
        }, 0);
      }
    };
    $scope.cancelResidualScan = function () {
      const cb = function (result) {
        setTimeout(focusBarcodeInput, 0);
        if (!result) return;

        initResidualScanningData();
        $scope.$apply();
      };

      confirm(
        "Are you sure you really want to discard all unprocessed residual items?",
        cb
      );
    };
    $scope.deleteResidualScanData = function () {
      const cb = function (result) {
        setTimeout(focusBarcodeInput, 0);
        if (!result) return;

        $scope.scannedResidualItems.forEach((i) => {
          if (i.checked) {
            $scope.numResidualChecked--;
          }
        });
        $scope.scannedResidualItems = $scope.scannedResidualItems.filter(
          (i) => !i.checked
        );
        $scope.allResidueQtyEntered = !$scope.scannedResidualItems.find(
          (i) => !i.residueQtyOK
        );
        $scope.$apply();
      };

      confirm(
        "Are you sure you want to delete all residual items marked with a trash can icon?",
        cb
      );
    };
    $scope.storeResidualScanData = function () {
      mask();
      $http
        .post("/production/lot/check/residualitems/", {
          user: userService.username,
          token: userService.token,
          lotid: $scope.selectedLot.id,
          items: $scope.scannedResidualItems.map((i) => {
            return {
              id: i.id,
              barcode: i.barcode,
            };
          }),
        })
        .then(
          function (res) {
            store();
          },
          function (err) {
            if (!!err.data) {
              err.data.forEach((r) => {
                if (!!r.err) {
                  const errItem = $scope.scannedResidualItems.find(
                    (i) => i.id == r.id
                  );
                  errItem.err = r.err;
                  errItem.checked = true;
                  errItem.residueLocked = true;
                  $scope.numResidualChecked++;
                }
              });
            }
            unmask();
            alert(
              "There are items that have caused problems in storing in the database. Please check the list, clear the issues, and try again."
            );
          }
        );
      return;

      function store() {
        $http
          .post("/production/lot/store/residualitems/", {
            user: userService.username,
            token: userService.token,
            lotid: $scope.selectedLot.id,
            items: $scope.scannedResidualItems.map((i) => {
              return {
                barcode: i.barcode,
                code: i.product.code,
                qty: i.qty,
                residueQty: i.residueQty,
                residueItemQty: i.residueItemQty,
              };
            }),
          })
          .then(
            function (res) {
              $scope.getIOProductsData(
                $scope.selectedLot,
                updateLotInfoIOProducts,
                true
              );
              initResidualScanningData();
              unmask();
              notify("The residual items data was stored successfully.");
            },
            function (err) {
              unmask();
              alert(
                "There was an error in storing the residual items data in the database."
              );
            }
          );
      }
    };

    $scope.consoleVisible = false;
    $scope.popupPosition = {};

    if ($scope.locationData.length == 1) {
      $scope.selectedLocation = $scope.locationData[0];
      $scope.locationChanged();
    }
  };

  /*****************************************************************************************/
  const productionLogsController = function (
    $scope,
    $state,
    $stateParams,
    $http,
    userService,
    stateStorageService,
    entityData,
    locationData,
    productData
  ) {
    $scope.fromDatePicker = new Pikaday({
      field: document.getElementById("from-date-picker"),
      format: "MM/DD/YY",
    });
    $scope.toDatePicker = new Pikaday({
      field: document.getElementById("to-date-picker"),
      format: "MM/DD/YY",
    });
    preprocessLocationData(
      $scope,
      locationData,
      userService.role == "SU" ? entityData : null
    );
    $scope.lotStates = lotStates;

    const initPeriod = function () {
      if (!$scope.selectedLocation) return;

      if (!$scope.toDate) {
        $scope.toDate = moment
          .tz($scope.selectedLocation.tz)
          .format("MM/DD/YY");
        $scope.toDatePicker.setDate($scope.toDate);
      }
      if (!$scope.fromDate) {
        $scope.fromDate = moment($scope.toDate, "MM/DD/YY")
          .subtract(1, "months")
          .format("MM/DD/YY");
        $scope.fromDatePicker.setDate($scope.fromDate);
      }
      if (compareDate($scope.fromDate, $scope.toDate) > 0) {
        [$scope.fromDate, $scope.toDate] = [$scope.toDate, $scope.fromDate];
        $scope.fromDatePicker.setDate($scope.fromDate);
        $scope.toDatePicker.setDate($scope.toDate);
      }
      $scope.lotFrom = $scope.lotTo = null; // from-date and to-date of $scope.productionLots
    };
    const updateLotInfoIOProducts = function (ioProducts) {
      $scope.lotInfo.ioProducts = ioProducts;
    };
    const updateTargetProductInfo = function (lot) {
      const targetProduct = lot.ioProducts.find(
        (p) => p.code == lot.targetproductcode
      );
      if (!!targetProduct && !!targetProduct.qty) {
        if (lot.unit == "box") lot.performance = targetProduct.numboxes;
        else lot.performance = targetProduct.qty;

        lot.yield = targetProduct.yield;
      }
    };
    const checkDatesAndFilterProductionLots = function () {
      if (!$scope.lotFrom || !$scope.lotTo) return false;

      if (
        compareDate($scope.lotFrom, $scope.fromDate) <= 0 &&
        compareDate($scope.lotTo, $scope.toDate) >= 0
      ) {
        $scope.productionLots = $scope.productionLots.filter(
          (l) =>
            compareDate(l.date, $scope.fromDate) >= 0 &&
            compareDate(l.date, $scope.toDate) <= 0
        );
        $scope.clearSearchParams();
        $scope.filterLots();
        setTimeout(function () {
          $scope.$apply();
        }, 0);
        return true;
      } else return false;
    };
    const restoreState = function () {
      const savedState = stateStorageService.getData("production logs");

      $scope.workshops = savedState.workshops;
      $scope.ioDefs = savedState.ioDefs;
      $scope.specialPrograms = savedState.specialPrograms;
      $scope.productionLots = savedState.productionLots;
      $scope.lotsToShow = savedState.lotsToShow;
      $scope.searchParams = savedState.searchParams;
      $scope.selectedLocation = savedState.selectedLocation;
      $scope.selectedEntity = $scope.selectedLocation.entity;
      $scope.fromDate = savedState.fromDate;
      $scope.fromDatePicker.setDate($scope.fromDate);
      $scope.toDate = savedState.toDate;
      $scope.toDatePicker.setDate($scope.toDate);
      $scope.selectLot(savedState.selectedLot.id);
      $scope.allLotsProcessed = true;
      setTimeout(function () {
        autoScrollTable(
          ".lots-list table tbody",
          $scope.lotsToShow,
          $scope.selectedLot,
          true
        );
      }, 0);

      stateStorageService.eraseData("production logs");
    };
    const saveSearchParams = function () {
      savedSearchParams = $scope.searchParams;
    };
    const restoreSearchParams = function () {
      $scope.searchParms = savedSearchParams;
    };
    let savedSearchParams;

    $scope.locationChanged = function () {
      if (!$scope.selectedLocation) {
        $scope.workshops = [];
        $scope.dateChanged();
        return;
      }
      initPeriod();
      $scope.dateChanged();
    };

    $scope.dateChanged = function () {
      if (!$scope.selectedLocation || !$scope.fromDate || !$scope.toDate)
        return;

      if (compareDate($scope.fromDate, $scope.toDate) > 0)
        [$scope.fromDate, $scope.toDate] = [$scope.toDate, $scope.fromDate];

      if (checkDatesAndFilterProductionLots())
        // take a subset of the existing $scope.productionLots
        return;

      mask();
      $scope.date = moment.tz($scope.selectedLocation.tz).format("MM/DD/YY");
      const p0 = $http.post("/production/workshops/all", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
      });
      const p1 = $http.post("/production/lots/period", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
        fromDate: $scope.fromDate,
        toDate: $scope.toDate,
      });
      let p = [p0, p1];

      if (
        !$scope.selectedEntity ||
        $scope.selectedEntity != $scope.selectedLocation.entity
      ) {
        const p2 = $http.post("/production/iodefinitions/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p2);
        const p3 = $http.post("/production/specialprograms/all", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedLocation.entity,
        });
        p.push(p3);
      }
      Promise.all(p).then(
        function (res) {
          $scope.workshops = res[0].data.rows;
          $scope.productionLots = res[1].data.rows;
          if (p.length > 2) {
            $scope.ioDefs = res[2].data.rows;
            $scope.specialPrograms = res[3].data.rows;
            $scope.selectedEntity = $scope.selectedLocation.entity;
          }
          $scope.productionLots = $scope.productionLots.filter(
            (l) => l.state >= IN_PRODUCTION
          );
          $scope.lotFrom = $scope.fromDate;
          $scope.lotTo = $scope.toDate;
          $scope.numLotsProcessed = 0;
          $scope.allLotsProcessed = false;
          $scope.getPeriodIOProductsData();
          $scope.clearSearchParams();
          $scope.filterLots();
          $scope.$apply();
          unmask();
        },
        function (err) {
          $scope.workshops = [];
          $scope.productionLots = [];
          $scope.lotFrom = $scope.lotTo = null;
          $scope.lotsToShow = [];
          $scope.$apply();
          unmask();
          alert(
            "There was an error in retrieving production lots data from the database."
          );
        }
      );
    };

    $scope.filterLots = function () {
      let lotsToShow = $scope.productionLots;

      $scope.searchParams.lotNumber = $scope.searchParams.lotNumber.trim();
      $scope.searchParams.purchaseOrderNumber =
        $scope.searchParams.purchaseOrderNumber.trim();
      if (
        !!$scope.searchParams.lotNumber ||
        !!$scope.searchParams.purchaseOrderNumber
      ) {
        $http
          .post("/production/lots/search", {
            user: userService.username,
            token: userService.token,
            location: $scope.selectedLocation.code,
            lotNumber: $scope.searchParams.lotNumber,
            orderNumber: $scope.searchParams.orderNumber,
          })
          .then(
            function (res) {
              $scope.searchParams.lotIds = res.data.rows.map((r) => r.id);
            },
            function (err) {
              $scope.searchParams.lotIds = [];
              alert("There was an error in accessing data in the database.");
            }
          )
          .then(function () {
            filter();
          });
      } else {
        $scope.searchParams.lotIds = null;
      }

      filter();
      return;

      function filter() {
        if (!!$scope.searchParams.workshop)
          lotsToShow = lotsToShow.filter(
            (l) => l.workshop == $scope.searchParams.workshop.id
          );
        if (!!$scope.searchParams.ioDef)
          lotsToShow = lotsToShow.filter(
            (l) => l.iodef == $scope.searchParams.ioDef.id
          );
        $scope.searchParams.salesOrderNumber =
          $scope.searchParams.salesOrderNumber.trim();
        if (!!$scope.searchParams.salesOrderNumber)
          lotsToShow = lotsToShow.filter(
            (l) => l.ordernumber == $scope.searchParams.salesOrderNumber
          );

        if ($scope.searchParams.tagList.length > 0) {
          const tags = $scope.searchParams.tagList.map((t) => t.code);
          lotsToShow = lotsToShow.filter(
            (l) => !!l.tags && tags.some((t) => l.tags.includes(t))
          );
        }
        $scope.searchParams.productCodes =
          $scope.searchParams.productCodes.trim();
        if (!!$scope.searchParams.productCodes) {
          const codes = $scope.searchParams.productCodes
            .split(",")
            .map((c) => c.trim());
          lotsToShow = lotsToShow.filter(
            (l) =>
              !!l.ioProducts &&
              codes.some((c) =>
                l.ioProducts.find((p) => p.code == c || p.generic == c)
              )
          );
        }
        if (!!$scope.searchParams.lotIds) {
          lotsToShow = lotsToShow.filter((l) =>
            $scope.searchParams.lotIds.includes(l.id)
          );
        }
        $scope.lotsToShow = lotsToShow;

        if ($scope.lotsToShow.length > 0)
          $scope.selectLot($scope.lotsToShow[0].id);
        else $scope.selectedLot = null;
      }
    };

    $scope.getPeriodIOProductsData = function () {
      mask();
      const p0 = $http.post("/production/lots/period/inputs", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
        fromDate: $scope.fromDate,
        toDate: $scope.toDate,
      });
      const p1 = $http.post("/production/lots/period/outputs", {
        user: userService.username,
        token: userService.token,
        location: $scope.selectedLocation.code,
        fromDate: $scope.fromDate,
        toDate: $scope.toDate,
      });
      Promise.all([p0, p1])
        .then(
          function (res) {
            const allInputs = res[0].data.rows;
            const allOutputs = res[1].data.rows;

            $scope.productionLots.forEach((l) => {
              const inputs = allInputs.filter((i) => i.lotid == l.id);
              const outputs = allOutputs.filter((i) => i.lotid == l.id);
              l.ioProducts = inputs.concat(outputs);
              l.ioProducts.forEach((ip) => {
                const product = productData.find((p) => p.code == ip.code);
                ip.name =
                  product.name +
                  (product.description ? " - " + product.description : "");
              });
              l.ioProducts.sort(compareIOProduct);
              updateTargetProductInfo(l);
              if (!!$scope.selectedLot && $scope.selectedLot == l)
                updateLotInfoIOProducts(l.ioProducts);

              $scope.numLotsProcessed++;
              if ($scope.numLotsProcessed == $scope.productionLots.length)
                $scope.allLotsProcessed = true;
            });
          },
          function (err) {
            alert(
              "There was an error in retrieving production results from the database."
            );
          }
        )
        .then(function () {
          $scope.$apply();
          unmask();
        });
    };
    $scope.statusCellColor = statusCellColor;
    $scope.productCellColor = productCellColor;
    $scope.productUse = productUse;
    $scope.integer = integer;
    $scope.fractional = fractional;
    $scope.totalQty = totalQty;
    $scope.selectLot = function (id) {
      const lot = $scope.lotsToShow.find((l) => l.id == id);

      $scope.selectedLot = lot;
      $scope.lotInfo = {};
      if (!lot) return;

      $scope.lotInfo.ioProducts = lot.ioProducts;
      $scope.lotInfo.tags = lot.tags;
      $scope.lotInfo.tagList = [];
      if (!!lot.tags) processTags($scope, lot.tags);
      $scope.lotInfo.orderNumber = lot.ordernumber;
      $scope.lotInfo.instructions = lot.instructions;
      $scope.lotInfo.sideNote = lot.sidenote;
      $scope.lotInfo.comments = lot.comments;
      $scope.lotInfo.prepStart = lot.prepstart;
      $scope.lotInfo.prepEnd = lot.prepend;
      $scope.lotInfo.productionStart = lot.productionstart;
      $scope.lotInfo.productionEnd = lot.productionend;

      resize();
    };
    $scope.openLotDetails = function () {
      stateStorageService.setData("production logs", {
        fromDate: $scope.fromDate,
        toDate: $scope.toDate,
        selectedLocation: $scope.selectedLocation,
        workshops: $scope.workshops,
        ioDefs: $scope.ioDefs,
        specialPrograms: $scope.specialPrograms,
        productionLots: $scope.productionLots,
        lotsToShow: $scope.lotsToShow,
        searchParams: $scope.searchParams,
        selectedLot: $scope.selectedLot,
      });

      if (stateStorageService.checkData("production log details"))
        stateStorageService.eraseData("production log details");

      $state.go(".info");
    };
    $scope.deleteTag = function (code) {
      $scope.searchParams.tagList.splice(
        $scope.searchParams.tagList.findIndex((t) => t.code == code),
        1
      ); // delete the selected tag
    };
    $scope.enterTag = function () {
      processTags($scope, $scope.selectedSpecialProgram.code, true);
      $scope.selectedSpecialProgram = null;
    };
    $scope.openSearchPanel = function () {
      saveSearchParams();
      $scope.searchOpen = true;
    };
    $scope.clearSearchParams = function () {
      $scope.searchParams.workshop = "";
      $scope.searchParams.ioDef = "";
      $scope.searchParams.tagList = [];
      $scope.searchParams.productCodes = "";
      $scope.searchParams.salesOrderNumber = "";
      $scope.searchParams.purchaseOrderNumber = "";
      $scope.searchParams.lotNumber = "";
      $scope.searchParams.lotIds = null;
    };
    $scope.closeSearchPanel = function () {
      restoreSearchParams();
      $scope.searchOpen = false;
    };
    $scope.search = function () {
      $scope.filterLots();
      saveSearchParams();
      $scope.searchOpen = false;
    };
    $scope.searchParams = {};

    if (stateStorageService.checkData("production logs")) {
      restoreState();
    } else {
      if ($scope.locationData.length == 1) {
        $scope.selectedLocation = $scope.locationData[0];
        $scope.locationChanged();
      }
      $scope.clearSearchParams();
    }
    $scope.searchOpen = false;
  };

  /*****************************************************************************************/
  const productionLogInfoController = function (
    $scope,
    $state,
    $stateParams,
    $http,
    userService,
    stateStorageService,
    entityData,
    locationData,
    productData
  ) {
    const restoreState = function () {
      const savedState = stateStorageService.getData("production log details");

      $scope.inputSummary = savedState.inputSummary;
      $scope.outputSummary = savedState.outputSummary;
      $scope.summary = savedState.summary;
      $scope.selectedItem = savedState.selectedItem;
      $scope.printEnabled = savedState.printEnabled;

      stateStorageService.eraseData("production log details");
    };
    const convertQuantity = function (qty, from, to) {
      if (from == to) {
        // no conversion needed
        return qty;
      }

      switch (from) {
        case "kg":
          qty *= 2.20462;
          break;
        case "oz":
          qty *= 0.0625;
          break;
        case "lbs":
          break;
        case "gal":
          qty *= 3.78541;
          break;
        case "litre":
          break;
        default:
          break;
      }
      switch (to) {
        case "kg":
          qty *= 0.453592;
          break;
        case "oz":
          qty *= 16;
          break;
        case "lbs":
          break;
        case "gal":
          qty *= 0.264172;
        case "litre":
          break;
        default:
          break;
      }
      return qty;
    };
    const convertDate = function (date) {
      // YYYY-MM-DD --> MM/DD/YY
      const ymd = date.split("-");
      return ymd[1] + "/" + ymd[2] + "/" + ymd[0].substring(2);
    };
    class Summary {
      table;
      entry;
      productUnit;
      baseIndex;

      constructor() {
        this.table = [];
        this.entry = {};
        this.productUnit = null;
        this.baseIndex = 0;
      }

      setProductUnit(unit) {
        this.productUnit = unit;
      }

      setBaseIndex(base) {
        this.baseIndex = base;
      }

      pushEntry() {
        if (this.entry.numboxes === undefined || !this.entry.numboxes) return;

        this.entry.index = this.baseIndex + this.table.length;
        this.entry.qty = convertQuantity(
          this.entry.qty,
          this.entry.unit,
          this.productUnit
        );
        this.table.push(this.entry);
        this.entry = {
          numboxes: 0,
          qty: 0,
          printSelected: false,
        };
      }
    }

    const getQty = function (entry, item) {
      const qty = parseFloat(item.qty);
      let actualqty = qty;
      let actualnumboxes;

      if (!!item.subboxqty) {
        if (item.issubbox) {
          actualqty = item.subboxqty;
          actualnumboxes = actualqty / qty;
        } else {
          actualqty = qty - item.subboxqty;
          actualnumboxes = actualqty / qty;
        }

        if (entry.actualnumboxes === undefined)
          entry.actualnumboxes = entry.numboxes;
      }

      entry.numboxes++;
      entry.qty += actualqty;
      if (entry.actualnumboxes !== undefined)
        entry.actualnumboxes += actualnumboxes;
    };
    const makeInputSummary = function (inputItems, base) {
      let summary = new Summary();
      let product = null;
      let entry = summary.entry;
      let lotNumber = null;
      let rLotId = null;
      let mLotId = null;
      let received = null;

      summary.setBaseIndex(base || 0);
      inputItems.forEach((i) => {
        if (i.code != product) {
          summary.pushEntry();
          entry = summary.entry;
          product = i.code;
          const ioProduct = $scope.selectedLot.ioProducts.find(
            (p) => p.code == product
          );
          entry.isHeader = true;
          entry.code = i.code;
          entry.name = ioProduct.name;
          entry.use = ioProduct.use;
          entry.actualnumboxes = ioProduct.actualnumboxes;
          entry.numboxes = ioProduct.numboxes;
          entry.qty = parseFloat(ioProduct.qty);
          summary.setProductUnit((entry.unit = ioProduct.unit));
          summary.pushEntry();
          entry = summary.entry;
          received = null;
          lotNumber = null;
          rLotId = null;
          mLotId = null;
        }
        if (i.received != received) {
          summary.pushEntry();
          entry = summary.entry;
          entry.date = convertDate(i.received);
          received = i.received;
          entry.reference = lotNumber = i.lotnumber;
          entry.rlotid = rLotId = i.rlotid;
          entry.mlotid = mLotId = i.mlotid;
          getQty(entry, i);
          entry.unit = i.unit;
          entry.print = !!entry.reference;
          entry.reportType = !!i.rlotid
            ? MATERIAL_CONSUMPTION
            : PRODUCTION_OUTPUT;
          return;
        }
        if (
          i.lotnumber != lotNumber ||
          i.rlotid != rLotId ||
          i.mlotid != mLotId
        ) {
          summary.pushEntry();
          entry = summary.entry;
          entry.date = convertDate(i.received);
          entry.reference = lotNumber = i.lotnumber;
          entry.rlotid = rLotId = i.rlotid;
          entry.mlotid = mLotId = i.mlotid;
          getQty(entry, i);
          entry.unit = i.unit;
          entry.print = !!entry.reference;
          entry.reportType = !!i.rlotid
            ? MATERIAL_CONSUMPTION
            : PRODUCTION_OUTPUT;
          return;
        }
        getQty(entry, i);
        return;
      });
      summary.pushEntry();

      return summary.table;
    };
    const makeOutputSummary = function (outputItems, base) {
      let summary = new Summary();
      let product = null;
      let entry = summary.entry;
      let shipment = null;
      let pallet = null;
      let lotNumber = null;
      let productUnit = null;
      let discarded = false;
      let inInventory = false;

      summary.setBaseIndex(base || 0);
      outputItems.forEach((i) => {
        if (i.code != product) {
          summary.pushEntry();
          entry = summary.entry;
          product = i.code;
          const ioProduct = $scope.selectedLot.ioProducts.find(
            (p) => p.code == product
          );
          entry.isHeader = true;
          entry.code = i.code;
          entry.name = ioProduct.name;
          entry.use = ioProduct.use;
          entry.numboxes = ioProduct.numboxes;
          entry.qty = parseFloat(ioProduct.qty);
          summary.setProductUnit((entry.unit = ioProduct.unit));
          entry.print = true;
          entry.reportType = PRODUCTION_OUTPUT;
          summary.pushEntry();
          entry = summary.entry;
          shipment = pallet = lotNumber = null;
          discarded = inInventory = false;
        }
        if (!!i.shippedout) {
          if (i.shipment != shipment) {
            summary.pushEntry();
            entry = summary.entry;
            entry.status = SHIPPED;
            entry.date = convertDate(i.shippedout);
            entry.reference = shipment = i.shipment;
            entry.pallet = pallet = i.pallet;
            entry.destination = destination = i.destination;
            entry.shippingid = i.shippingid;
            entry.palletid = i.palletid;
            entry.numboxes = 1;
            entry.qty = parseFloat(i.qty);
            entry.unit = i.unit;
            entry.print = true;
            entry.reportType = SHIPPING_MANIFEST;
            return;
          }
          if (i.pallet != pallet) {
            summary.pushEntry();
            entry = summary.entry;
            entry.status = SHIPPED;
            entry.date = convertDate(i.shippedout);
            entry.reference = shipment = i.shipment;
            entry.pallet = pallet = i.pallet;
            entry.destination = destination = i.destination;
            entry.shippingid = i.shippingid;
            entry.palletid = i.palletid;
            entry.numboxes = 1;
            entry.qty = parseFloat(i.qty);
            entry.unit = i.unit;
            entry.print = true;
            entry.reportType = SHIPPING_MANIFEST;
            return;
          }
          entry.numboxes++;
          entry.qty += parseFloat(i.qty);
          return;
        }
        if (!!i.consumed) {
          if (i.lotnumber != lotNumber) {
            summary.pushEntry();
            entry = summary.entry;
            entry.status = CONSUMED;
            entry.date = convertDate(i.consumed);
            entry.reference = lotNumber = i.lotnumber;
            entry.numboxes = 1;
            entry.qty = parseFloat(i.qty);
            entry.unit = i.unit;
            return;
          }
          entry.numboxes++;
          entry.qty += parseFloat(i.qty);
          return;
        }
        if (!!i.discarded) {
          if (!discarded) {
            discarded = true;
            summary.pushEntry();
            entry = summary.entry;
            entry.status = DISCARDED;
            entry.date = convertDate(i.discarded);
            entry.numboxes = 1;
            entry.qty = parseFloat(i.qty);
            entry.unit = i.unit;
            return;
          }
          entry.numboxes++;
          entry.qty += parseFloat(i.qty);
          return;
        }
        if (!inInventory) {
          inInventory = true;
          summary.pushEntry();
          entry = summary.entry;
          entry.status = IN_INVENTORY;
          entry.numboxes = 1;
          entry.qty = parseFloat(i.qty);
          entry.unit = i.unit;
          return;
        }
        entry.numboxes++;
        entry.qty += parseFloat(i.qty);
        return;
      });
      summary.pushEntry();

      return summary.table;
    };

    $scope.integer = integer;
    $scope.fractional = fractional;
    $scope.selectedLot =
      stateStorageService.getData("production logs").selectedLot;

    if (stateStorageService.checkData("production log details")) {
      restoreState();
    } else {
      mask();
      const p0 = $http.post("/production/lot/inputs/items", {
        user: userService.username,
        token: userService.token,
        id: $scope.selectedLot.id,
      });
      const p1 = $http.post("/production/lot/outputs/items", {
        user: userService.username,
        token: userService.token,
        id: $scope.selectedLot.id,
      });
      Promise.all([p0, p1])
        .then(
          function (res) {
            const inputItems = res[0].data.rows;
            const outputItems = res[1].data.rows;
            $scope.inputSummary = makeInputSummary(inputItems);
            $scope.outputSummary = makeOutputSummary(
              outputItems,
              $scope.inputSummary.length
            );
            $scope.summary = $scope.inputSummary.concat($scope.outputSummary);
          },
          function (err) {
            alert(
              "There was an error in retrieving production results from the database."
            );
            $scope.inputSummary = [];
            $scope.outputSummary = [];
            $scope.summary = [];
          }
        )
        .then(function () {
          $scope.$apply();
          resize();
          unmask();
        });
      $scope.selectedItem = null;
    }

    $scope.productCellColor = productCellColor;
    $scope.productUse = productUse;
    $scope.itemStatusCellColor = itemStatusCellColor;
    $scope.itemStatusName = itemStatusName;
    $scope.reportTitles = reportTitles;

    $scope.selectReport = function (index) {
      $scope.printEnabled = false;
      $scope.selectedItem = null;
      $scope.summary.forEach((i) => {
        if (i.index == index) i.printSelected = !i.printSelected;
        else i.printSelected = false;

        $scope.printEnabled |= i.printSelected;
        if (i.printSelected) $scope.selectedItem = i;
      });
    };
    $scope.back = function () {
      $state.go("^");
    };
    $scope.print = function (index) {
      if (index !== undefined) {
        $scope.summary.forEach((i) => {
          i.printSelected = i.index == index;
        });
        $scope.selectedItem = $scope.summary[index];
        $scope.printEnabled = true;
      }

      let product;

      stateStorageService.setData("production log details", {
        inputSummary: $scope.inputSummary,
        outputSummary: $scope.outputSummary,
        summary: $scope.summary,
        selectedItem: $scope.selectedItem,
        printEnabled: $scope.printEnabled,
      });

      if ($scope.selectedItem.isHeader) {
        $state.go(".production", {
          lotid: $scope.selectedLot.id,
          product: $scope.selectedItem.code,
        });
      } else {
        for (let i = $scope.selectedItem.index; i >= 0; i--) {
          if ($scope.summary[i].isHeader) {
            product = $scope.summary[i];
            break;
          }
        }
        if (product.use == "MO" || product.use == "BY") {
          $state.go(".shipping", {
            location:
              stateStorageService.getData("production logs").selectedLocation
                .code,
            shipmentid: $scope.selectedItem.shippingid,
            palletid: $scope.selectedItem.palletid,
          });
        } else if ($scope.selectedItem.reportType == MATERIAL_CONSUMPTION) {
          $state.go(".consumption", {
            lotid: $scope.selectedItem.rlotid,
          });
        } else {
          $state.go(".production", {
            lotid: $scope.selectedItem.mlotid,
            product: product.code,
          });
        }
      }
    };
  };

  /*****************************************************************************************/
  const productionLogInfoPrintController = function (
    $scope,
    $state,
    $stateParams,
    $http,
    userService
  ) {
    $scope.back = function () {
      $state.go("^", $stateParams);
    };

    const username = userService.username;
    const token = userService.token;
    const lotid = $stateParams.lotid;
    const product = $stateParams.product;
    const location = $stateParams.location;
    const shipmentid = $stateParams.shipmentid;
    const palletid = $stateParams.palletid;

    if (!!shipmentid)
      $scope.pdfcontent =
        "/inventory/manifest?location=" +
        location +
        "&palletid=" +
        palletid +
        "&shipmentid=" +
        shipmentid +
        "&token=" +
        token +
        "&username=" +
        username;
    else if (!!product)
      $scope.pdfcontent =
        "/production/lot/output_report?user=" +
        username +
        "&token=" +
        token +
        "&id=" +
        lotid +
        "&product=" +
        product;
    else if (!!lotid)
      $scope.pdfcontent =
        "/receiving/consumption_log?user=" +
        username +
        "&token=" +
        token +
        "&id=" +
        lotid;

    mask();
    setTimeout(function () {
      unmask();
    }, 1000);
  };

  /*****************************************************************************************/
  const inputOutputController = function (
    $scope,
    $state,
    $http,
    userService,
    entityData,
    productData
  ) {
    const checkData = function () {
      if (!checkTextField($scope, "ioDefName", "Name", 15, true)) return false;
      if ($scope.ioDefName.slice(-1) == "@") {
        // the last character of name
        $scope.errMsg = "Invalid character(s) in name.";
        return false;
      }
      if (!checkTextField($scope, "ioDefDescription", "Description", 50, false))
        return false;
      if (!$scope.ioDefDescription) $scope.ioDefDescription = null;

      if ($scope.isNew) {
        $scope.newIODef = {
          entity: $scope.selectedEntity.code,
          name: $scope.ioDefName,
          description: $scope.ioDefDescription,
        };
      } else {
        $scope.updatedIODef = {
          id: $scope.selectedIODef.id,
          entity: $scope.selectedEntity.code,
        };
        if ($scope.ioDefName != $scope.selectedIODef.name)
          $scope.updatedIODef.name = $scope.ioDefName;
        if ($scope.ioDefDescription != $scope.selectedIODef.description)
          $scope.updatedIODef.description = $scope.ioDefDescription;
      }

      return true;
    };
    const checkProductData = function () {
      if (!checkTextField($scope, "ioProductCode", "Product Code", 10, true))
        return false;
      if (
        !checkTextField($scope, "ioProductFormula", "Yield Formula", 40, false)
      )
        return false;
      if (!$scope.ioProductUse) {
        $scope.errMsg = "Product use must be specified.";
        return false;
      }
      if (!$scope.ioProductUnit) {
        $scope.errMsg = "Product unit must be specified.";
        return false;
      }
      if (!!$scope.ioProductNumber) {
        if (
          $scope.ioDetailList.filter(
            (d) =>
              d.number == $scope.ioProductNumber &&
              (!$scope.selectedIOProduct || d.id != $scope.selectedIOProduct.id)
          ).length != 0
        ) {
          $scope.errMsg = "Product number is already used.";
          return false;
        }
      }
      if (
        !!$scope.ioProductFormula &&
        !/^[0-9A-E.$/*+\-() ]*$/.test($scope.ioProductFormula)
      ) {
        $scope.errMsg = "Invalid character(s) in yield formula.";
        return false;
      }
      if (!$scope.ioProductNumber && !!$scope.ioProductFormula) {
        $scope.errMsg =
          "Product number must be specified in order to add a yield formula.";
        return false;
      }
      if (
        !!$scope.ioProductFormula &&
        !$scope.ioProductFormula.includes("$" + $scope.ioProductNumber)
      ) {
        $scope.errMsg = "Missing product number in the yield formula.";
        return false;
      }
      if (!!$scope.ioProductFormula && !checkFormula()) {
        $scope.errMsg = "Yield formula is invalid.";
        return false;
      }

      if ($scope.isNewProduct) {
        $scope.newIOProduct = {};
        $scope.newIOProduct.defid = $scope.selectedIODef.id;
        $scope.newIOProduct.code = $scope.ioProductCode;
        $scope.newIOProduct.type = $scope.ioProductType ? "G" : "S";
        $scope.newIOProduct.name = $scope.ioProductName;
        $scope.newIOProduct.number = !!$scope.ioProductNumber
          ? $scope.ioProductNumber
          : null;
        $scope.newIOProduct.use = $scope.ioProductUse.code;
        $scope.newIOProduct.unit = $scope.ioProductUnit;
        $scope.newIOProduct.formula = $scope.ioProductFormula;
      } else {
        $scope.updatedIOProduct = {};
        $scope.updatedIOProduct.id = $scope.selectedIOProduct.id;
        $scope.updatedIOProduct.defid = $scope.selectedIOProduct.defid;
        if ($scope.ioProductCode != $scope.selectedIOProduct.code)
          $scope.updatedIOProduct.code = $scope.ioProductCode;
        if (($scope.ioProductType ? "G" : "S") != $scope.selectedIOProduct.type)
          $scope.updatedIOProduct.type = $scope.ioProductType ? "G" : "S";
        if (
          (!!$scope.ioProductNumber ? $scope.ioProductNumber : null) !=
          $scope.selectedIOProduct.number
        )
          $scope.updatedIOProduct.number = !!$scope.ioProductNumber
            ? $scope.ioProductNumber
            : null;
        if ($scope.ioProductUse.code != $scope.selectedIOProduct.use)
          $scope.updatedIOProduct.use = $scope.ioProductUse.code;
        if ($scope.ioProductUnit != $scope.selectedIOProduct.unit)
          $scope.updatedIOProduct.unit = $scope.ioProductUnit;
        if ($scope.ioProductFormula != $scope.selectedIOProduct.formula)
          $scope.updatedIOProduct.formula = $scope.ioProductFormula;
      }
      return true;
    };
    const checkFormula = function () {
      let v = {
        $1: NaN,
        $2: NaN,
        $3: NaN,
        $4: NaN,
        $5: NaN,
        $6: NaN,
        $7: NaN,
        $8: NaN,
        $9: NaN,
        $A: NaN,
        $B: NaN,
        $C: NaN,
        $D: NaN,
        $E: NaN,
      };
      let result;

      $scope.ioDetailList.forEach((d) => {
        if (!!d.number) v["$" + d.number] = Math.random() * 30 + 10;
      });

      try {
        result = eval($scope.ioProductFormula.replaceAll("$", "v.$"));
      } catch (err) {
        return false;
      }

      if (typeof result != "number") return false;
      if (result == Infinity || result == -Infinity) return false;

      return true;
    };
    const updateAllIOProducts = function () {
      const updatedProduct = $scope.allIOProducts.find(
        (p) => p.id == $scope.selectedIOProduct.id
      );

      if ($scope.updatedIOProduct.code !== undefined) {
        updatedProduct.code = $scope.updatedIOProduct.code;
        updatedProduct.name = $scope.ioProductName;
      }
      if ($scope.updatedIOProduct.type !== undefined)
        updatedProduct.type = $scope.updatedIOProduct.type;
      if ($scope.updatedIOProduct.number !== undefined)
        updatedProduct.number = $scope.updatedIOProduct.number;
      if ($scope.updatedIOProduct.use !== undefined)
        updatedProduct.use = $scope.updatedIOProduct.use;
      if ($scope.updatedIOProduct.unit !== undefined)
        updatedProduct.unit = $scope.updatedIOProduct.unit;
      if ($scope.updatedIOProduct.formula !== undefined)
        updatedProduct.formula = $scope.updatedIOProduct.formula;
    };

    $scope.entityChanged = function () {
      if (!!$scope.selectedEntity) {
        mask();
        const p0 = $http.post("/production/iodefinitions", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedEntity.code,
        });
        const p1 = $http.post("/production/ioproducts", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedEntity.code,
        });
        const p2 = $http.post("/production/genericproducts", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedEntity.code,
        });
        Promise.all([p0, p1, p2]).then(
          function (res) {
            $scope.ioDefList = res[0].data.rows;
            $scope.allIOProducts = res[1].data.rows;
            $scope.allIOProducts.sort(compareIOProduct);
            $scope.genericProductList = res[2].data.rows;
            $scope.productList = productData.filter(
              (p) =>
                p.inuse &&
                (p.properties & mSOURCE ||
                  p.manufacturer == $scope.selectedEntity.code)
            );
            if ($scope.ioDefList.length == 1) {
              $scope.selectIODef($scope.ioDefList[0].id);
            } else {
              $scope.ioDefList.sort(compareName);
              $scope.selectedIODef = null;
              clearIODefDataFields($scope);
            }
            $scope.$apply();
            unmask();
          },
          function (err) {
            $scope.ioDefList = [];
            $scope.selectedIODef = null;
            clearIODefDataFields($scope);
            $scope.$apply();
            unmask();
            alert(
              "There was an error in retrieving I/O definitions data from the database."
            );
          }
        );
      } else {
        $scope.ioDefList = [];
        $scope.selectedIODef = null;
      }
      $scope.isChanged = false;
      $scope.isNew = false;
    };
    $scope.selectIODef = function (id) {
      $scope.selectedIODef = $scope.ioDefList.find((d) => d.id == id);
      $scope.ioDefName = $scope.selectedIODef.name;
      $scope.ioDefDescription = $scope.selectedIODef.description;
      $scope.ioDetailList = $scope.allIOProducts.filter(
        (p) => p.defid == $scope.selectedIODef.id
      );
      $scope.isChanged = false;
      $scope.isNew = false;
      $scope.selectedIOProduct = null;
      $scope.isProductChanged = false;
      $scope.isNewProduct = false;
    };
    $scope.new = function () {
      $scope.isNew = true;
      $scope.selectedIODef = null;
      clearIODefDataFields($scope);
      $scope.isChanged = false;
    };
    $scope.duplicate = function () {
      if ($scope.ioDefName.slice(-1) == "@") {
        // the last character of name
        $scope.errMsg = "Invalid character(s) in name.";
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(`/production/iodefinition/duplicate/${$scope.selectedIODef.id}`, {
          user: userService.username,
          token: userService.token,
        })
        .then(
          function (res) {
            $scope.newIODef = {};
            $scope.newIODef.id = res.data.newid; // id returned from DB
            $scope.newIODef.name = $scope.selectedIODef.name + "@";
            $scope.newIODef.description = $scope.selectedIODef.description;
            $scope.ioDefList.push($scope.newIODef);
            $scope.ioDefList.sort(compareName);
            $scope.allIOProducts = $scope.allIOProducts.concat(res.data.rows); // duplicated i/o products, which were returned from DB
            $scope.allIOProducts.sort(compareIOProduct);
            $scope.selectIODef($scope.newIODef.id);
            setTimeout(function () {
              autoScrollTable(
                ".io-def-list table tbody",
                $scope.ioDefList,
                $scope.selectedIODef,
                true
              );
              unmask();
              notify("The I/O definition data was duplicated successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in duplicating the I/O definition data to the database. " +
                err.data.err
            );
          }
        );
    };
    $scope.cancel = function () {
      const cb = function (result) {
        if (!result) return;

        clearIODefDataFields($scope);
        $scope.isChanged = false;
        if (!$scope.isNew) {
          const id = $scope.selectedIODef.id;
          $scope.selectedIODef = null;
          $scope.selectIODef(id);
        }
        $scope.$apply();
      };

      if (!$scope.isChanged) {
        $state.go("^");
      } else {
        confirm("Are you sure you want to discard all the changes?", cb);
      }
    };
    $scope.update = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(`/production/iodefinition/update/${$scope.selectedIODef.id}`, {
          user: userService.username,
          token: userService.token,
          updatedIODef: $scope.updatedIODef,
        })
        .then(
          function () {
            if ($scope.updatedIODef.name !== undefined)
              $scope.selectedIODef.name = $scope.updatedIODef.name;
            if ($scope.updatedIODef.description !== undefined)
              $scope.selectedIODef.description =
                $scope.updatedIODef.description;

            $scope.selectIODef($scope.updatedIODef.id);
            setTimeout(function () {
              unmask();
              notify("The I/O definition data was updated successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in updating the I/O definition data in the database."
            );
          }
        );
    };
    $scope.delete = function () {
      const cb = function (result) {
        if (!result) return;

        mask();
        const command = $scope.ioDefName.slice(-1) == "@" ? "remove" : "delete";
        $http
          .post(
            `/production/iodefinition/${command}/${$scope.selectedIODef.id}`,
            {
              user: userService.username,
              token: userService.token,
            }
          )
          .then(
            function () {
              $scope.ioDefList.splice(
                $scope.ioDefList.findIndex(
                  (d) => d.id == $scope.selectedIODef.id
                ),
                1
              ); // delete an I/O definition
              $scope.selectedIODef = null;
              clearIODefDataFields($scope);
              setTimeout(function () {
                scrollUpTable(".io-def-list table tbody");
                unmask();
                notify("The I/O definition data was deleted successfully.");
              }, 0);
            },
            function (err) {
              unmask();
              alert(
                "There was an error in deleting the I/O definition data in the database."
              );
            }
          );
      };

      confirm(
        "Are you sure you want to delete the selected I/O definition?",
        cb
      );
    };
    $scope.add = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post("/production/iodefinition/add", {
          user: userService.username,
          token: userService.token,
          newIODef: $scope.newIODef,
        })
        .then(
          function (res) {
            $scope.newIODef.id = res.data.rows[0].id; // id returned from INSERT
            $scope.ioDefList.push($scope.newIODef);
            $scope.ioDefList.sort(compareName);
            $scope.selectIODef($scope.newIODef.id);
            setTimeout(function () {
              autoScrollTable(
                ".io-def-list table tbody",
                $scope.ioDefList,
                $scope.selectedIODef,
                true
              );
              unmask();
              notify("The I/O definition data was added successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in adding the I/O definition data to the database. " +
                err.data.err
            );
          }
        );
    };

    $scope.selectIOProduct = function (id) {
      $scope.selectedIOProduct = $scope.ioDetailList.find((d) => d.id == id);
      $scope.ioProductType = $scope.selectedIOProduct.type == "G";
      if (!!$scope.ioProductType)
        // generic
        $scope.productUses = productUses.filter((u) => u.type == "I");
      else $scope.productUses = productUses;
      $scope.ioProductCode = $scope.selectedIOProduct.code;
      $scope.ioProductName = $scope.selectedIOProduct.name;
      $scope.ioProductUnit = $scope.selectedIOProduct.unit;
      $scope.ioProductUse = $scope.productUses.find(
        (u) => u.code == $scope.selectedIOProduct.use
      );
      $scope.ioProductNumber = $scope.selectedIOProduct.number;
      $scope.ioProductFormula = $scope.selectedIOProduct.formula;
      $scope.isProductChanged = false;
      $scope.isNewProduct = false;
    };
    $scope.productCellColor = productCellColor;
    $scope.codeChanged = function () {
      const p = $scope.ioProductList.find(
        (p) => p.code == $scope.ioProductCode
      );
      if (!!p) {
        $scope.ioProductName =
          p.name + (!!p.description ? " - " + p.description : "");
        if (!$scope.ioProductType) $scope.ioProductUnit = p.unit;
        else $scope.ioProductUnit = "";
      } else {
        $scope.ioProductName = "";
        $scope.ioProductUnit = "";
      }
      $scope.isProductChanged = true;
    };
    $scope.typeChanged = function () {
      clearIOProductDataFields($scope, true);
      $scope.ioProductList = $scope.ioProductType
        ? $scope.genericProductList
        : $scope.productList;
      $scope.isProductChanged = true;
    };
    $scope.useChanged = function () {
      if (!!$scope.ioProductUse) {
        if ($scope.ioProductUse.type == "I") $scope.ioProductFormula = "";
      }
      $scope.isProductChanged = true;
    };
    $scope.newProduct = function () {
      $scope.isNewProduct = true;
      $scope.selectedIOProduct = null;
      clearIOProductDataFields($scope);
      $scope.isProductChanged = false;
    };
    $scope.cancelProduct = function () {
      const cb = function (result) {
        if (!result) return;

        clearIOProductDataFields($scope);
        $scope.isProductChanged = false;
        if (!$scope.isNewProduct) {
          const id = $scope.selectedIOProduct.id;
          $scope.selectedIOProduct = null;
          $scope.selectIOProduct(id);
        }
        $scope.$apply();
      };

      confirm("Are you sure you want to discard all the changes?", cb);
    };
    $scope.addProduct = function () {
      if (!checkProductData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post("/production/ioproduct/add", {
          user: userService.username,
          token: userService.token,
          newIOProduct: $scope.newIOProduct,
        })
        .then(
          function (res) {
            $scope.newIOProduct.id = res.data.rows[0].id; // id returned from INSERT
            $scope.allIOProducts.push($scope.newIOProduct);
            $scope.allIOProducts.sort(compareIOProduct);
            $scope.selectIODef($scope.selectedIODef.id);
            $scope.selectIOProduct($scope.newIOProduct.id);
            setTimeout(function () {
              autoScrollTable(
                ".io-detail-list table tbody",
                $scope.ioDetailList,
                $scope.selectedIOProduct,
                true
              );
              unmask();
              notify("The I/O product data was added successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in adding the I/O product data to the database. " +
                err.data.err
            );
          }
        );
    };
    $scope.updateProduct = function () {
      if (!checkProductData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(`/production/ioproduct/update/${$scope.updatedIOProduct.id}`, {
          user: userService.username,
          token: userService.token,
          updatedIOProduct: $scope.updatedIOProduct,
        })
        .then(
          function (res) {
            updateAllIOProducts();
            $scope.allIOProducts.sort(compareIOProduct);
            $scope.selectIODef($scope.selectedIODef.id);
            $scope.selectIOProduct($scope.updatedIOProduct.id);
            setTimeout(function () {
              autoScrollTable(
                ".io-detail-list table tbody",
                $scope.ioDetailList,
                $scope.selectedIOProduct,
                true
              );
              unmask();
              notify("The I/O product data was updated successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in updating the I/O product data to the database."
            );
          }
        );
    };
    $scope.deleteProduct = function () {
      const cb = function (result) {
        if (!result) return;

        mask();
        $http
          .post(`/production/ioproduct/delete/${$scope.selectedIOProduct.id}`, {
            user: userService.username,
            token: userService.token,
          })
          .then(
            function () {
              $scope.ioDetailList.splice(
                $scope.ioDetailList.findIndex(
                  (d) => d.id == $scope.selectedIOProduct.id
                ),
                1
              ); // delete an I/O product
              $scope.allIOProducts.splice(
                $scope.allIOProducts.findIndex(
                  (p) => p.id == $scope.selectedIOProduct.id
                ),
                1
              ); // delete an I/O product
              $scope.selectedIOProduct = null;
              clearIOProductDataFields($scope);
              setTimeout(function () {
                scrollUpTable(".io-detail-list table tbody");
                unmask();
                notify("The I/O product data was deleted successfully.");
              }, 0);
            },
            function (err) {
              unmask();
              alert(
                "There was an error in deleting the I/O product data in the database."
              );
            }
          );
      };

      confirm("Are you sure you want to delete the selected I/O product?", cb);
    };
    $scope.openProductSearchPanel = function () {
      $scope.filteredProductList = $scope.ioProductType
        ? $scope.genericProductList
        : $scope.productList;
      $scope.selectedProduct = null;
      clearSearchFields($scope);
      $scope.searchOpen = true;
    };
    $scope.clear = function () {
      clearSearchFields($scope);
      $scope.search();
    };
    $scope.search = function () {
      searchProduct($scope, $scope.ioProductType);
    };
    $scope.selectProduct = function (code) {
      if (!!code)
        $scope.selectedProduct = $scope.filteredProductList.find(
          (p) => p.code == code
        );
      else {
        $scope.ioProductCode = $scope.selectedProduct.code;
        $scope.codeChanged();
      }
    };

    $scope.productUnits = productUnits;
    $scope.productUses = productUses;
    $scope.productNumbers = productNumbers;

    entityData =
      userService.role == "SU"
        ? entityData.filter((e) => e.type == "PR")
        : entityData.filter((e) => e.code == userService.businessentity);
    entityData.sort(compareName);
    $scope.entityList = entityData;
    if ($scope.entityList.length == 1) {
      $scope.selectedEntity = $scope.entityList[0];
      $scope.entityFixed = true;
      $scope.entityChanged();
    } else {
      $scope.entityFixed = false;
      $scope.selectedEntity = null;
    }
    $scope.searchOpen = false;
  };

  /*****************************************************************************************/
  const genericProductsController = function (
    $scope,
    $state,
    $http,
    userService,
    entityData,
    productData
  ) {
    const checkData = function () {
      if (!checkTextField($scope, "genericProductCode", "Code", 10, true))
        return false;
      if (!checkTextField($scope, "genericProductName", "Name", 20, true))
        return false;
      if (
        !checkTextField(
          $scope,
          "genericProductDescription",
          "Description",
          40,
          false
        )
      )
        return false;
      if (!$scope.genericProductDescription)
        $scope.genericProductDescription = null;

      if ($scope.isNew) {
        $scope.newGenericProduct = {
          entity: $scope.selectedEntity.code,
          code: $scope.genericProductCode,
          name: $scope.genericProductName,
          description: $scope.genericProductDescription,
        };
      } else {
        $scope.updatedGenericProduct = {
          id: $scope.selectedGenericProduct.id,
          entity: $scope.selectedEntity.code,
        };
        if ($scope.genericProductCode != $scope.selectedGenericProduct.code)
          $scope.updatedGenericProduct.code = $scope.genericProductCode;
        if ($scope.genericProductName != $scope.selectedGenericProduct.name)
          $scope.updatedGenericProduct.name = $scope.genericProductName;
        if (
          $scope.genericProductDescription !=
          $scope.selectedGenericProduct.description
        )
          $scope.updatedGenericProduct.description =
            $scope.genericProductDescription;
      }

      return true;
    };
    const checkEditedAssociatedProducts = function () {
      $scope.updatedAssociatedProducts = {
        id: $scope.selectedGenericProduct.id,
        deleted: [],
        added: [],
      };
      $scope.associatedProductList.forEach((a) => {
        if (!$scope.editedAssociatedProductList.find((e) => e.code == a.code))
          $scope.updatedAssociatedProducts.deleted.push(a.code);
      });
      // the reason for scanning the whole edited list below redundantly is to preserve it just in case of DB errors in storing the results later
      // if the user wants to continue to stay in the panel even after the errors, we need to keep the edited list intact.
      $scope.editedAssociatedProductList.forEach((e) => {
        if (!$scope.associatedProductList.find((a) => a.code == e.code))
          $scope.updatedAssociatedProducts.added.push({
            code: e.code,
            name: e.name,
            description: e.description,
          });
      });
      return (
        $scope.updatedAssociatedProducts.deleted.length > 0 ||
        $scope.updatedAssociatedProducts.added.length > 0
      );
    };

    $scope.entityChanged = function () {
      if (!!$scope.selectedEntity) {
        mask();
        const p0 = $http.post("/production/genericproducts", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedEntity.code,
        });
        const p1 = $http.post("/production/associatedproducts", {
          user: userService.username,
          token: userService.token,
          entity: $scope.selectedEntity.code,
        });
        Promise.all([p0, p1]).then(
          function (res) {
            $scope.genericProductList = res[0].data.rows;
            $scope.allAssociatedProducts = res[1].data.rows;
            $scope.productList = productData.filter(
              (p) =>
                (p.inuse && p.properties & mSOURCE) ||
                p.manufacturer == $scope.selectedEntity.code
            );
            if ($scope.genericProductList.length == 1) {
              $scope.selectGenericProduct($scope.genericProductList[0].id);
            } else {
              $scope.genericProductList.sort(compareCode);
              $scope.selectedGenericProduct = null;
              clearGenericProductDataFields($scope);
            }
            $scope.$apply();
            unmask();
          },
          function (err) {
            $scope.genericProductList = [];
            $scope.selectedGenericProduct = null;
            clearGenericProductDataFields($scope);
            $scope.$apply();
            unmask();
            alert(
              "There was an error in retrieving generic products data from the database."
            );
          }
        );
      } else {
        $scope.genericProductList = [];
        $scope.selectedGenericProduct = null;
      }
      $scope.isChanged = false;
      $scope.isNew = false;
    };
    $scope.selectGenericProduct = function (id) {
      $scope.selectedGenericProduct = $scope.genericProductList.find(
        (g) => g.id == id
      );
      $scope.genericProductCode = $scope.selectedGenericProduct.code;
      $scope.genericProductName = $scope.selectedGenericProduct.name;
      $scope.genericProductDescription =
        $scope.selectedGenericProduct.description;
      $scope.associatedProductList = $scope.allAssociatedProducts.filter(
        (a) => a.id == $scope.selectedGenericProduct.id
      );
      $scope.isChanged = false;
      $scope.isNew = false;
    };
    $scope.new = function () {
      $scope.isNew = true;
      $scope.selectedGenericProduct = null;
      clearGenericProductDataFields($scope);
      $scope.isChanged = false;
    };
    $scope.cancel = function () {
      const cb = function (result) {
        if (!result) return;

        clearGenericProductDataFields($scope);
        $scope.isChanged = false;
        if (!$scope.isNew) {
          const id = $scope.selectedGenericProduct.id;
          $scope.selectedGenericProduct = null;
          $scope.selectGenericProduct(id);
        }
        $scope.$apply();
      };

      if (!$scope.isChanged) {
        $state.go("^");
      } else {
        confirm("Are you sure you want to discard all the changes?", cb);
      }
    };
    $scope.update = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(
          `/production/genericproduct/update/${$scope.selectedGenericProduct.id}`,
          {
            user: userService.username,
            token: userService.token,
            updatedGenericProduct: $scope.updatedGenericProduct,
          }
        )
        .then(
          function () {
            if ($scope.updatedGenericProduct.code !== undefined)
              $scope.selectedGenericProduct.code =
                $scope.updatedGenericProduct.code;
            if ($scope.updatedGenericProduct.name !== undefined)
              $scope.selectedGenericProduct.name =
                $scope.updatedGenericProduct.name;
            if ($scope.updatedGenericProduct.description !== undefined)
              $scope.selectedGenericProduct.description =
                $scope.updatedGenericProduct.description;

            $scope.selectGenericProduct($scope.updatedGenericProduct.id);
            setTimeout(function () {
              unmask();
              notify("The generic product data was updated successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in updating the generic product data in the database."
            );
          }
        );
    };
    $scope.delete = function () {
      const cb = function (result) {
        if (!result) return;

        mask();
        $http
          .post(
            `/production/genericproduct/delete/${$scope.selectedGenericProduct.id}`,
            {
              user: userService.username,
              token: userService.token,
            }
          )
          .then(
            function () {
              $scope.genericProductList.splice(
                $scope.genericProductList.findIndex(
                  (g) => g.id == $scope.selectedGenericProduct.id
                ),
                1
              ); // delete a generic product
              $scope.selectedGenericProduct = null;
              clearGenericProductDataFields($scope);
              setTimeout(function () {
                scrollUpTable(".generic-product-list table tbody");
                unmask();
                notify("The generic product data was deleted successfully.");
              }, 0);
            },
            function (err) {
              unmask();
              alert(
                "There was an error in deleting the generic product data in the database."
              );
            }
          );
      };

      confirm(
        "Are you sure you want to delete the selected generic product?",
        cb
      );
    };
    $scope.add = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post("/production/genericproduct/add", {
          user: userService.username,
          token: userService.token,
          newGenericProduct: $scope.newGenericProduct,
        })
        .then(
          function (res) {
            $scope.newGenericProduct.id = res.data.rows[0].id; // id returned from INSERT
            $scope.genericProductList.push($scope.newGenericProduct);
            $scope.genericProductList.sort(compareCode);
            $scope.selectGenericProduct($scope.newGenericProduct.id);
            setTimeout(function () {
              autoScrollTable(
                ".generic-product-list table tbody",
                $scope.genericProductList,
                $scope.selectedGenericProduct,
                true
              );
              unmask();
              notify("The generic product data was added successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in adding the generic product data to the database. " +
                err.data.err
            );
          }
        );
    };
    $scope.openAssociatedProductsPanel = function () {
      $scope.filteredProductList = $scope.productList;
      $scope.selectedProduct = null;
      $scope.editedAssociatedProductList = $scope.associatedProductList.map(
        (a) => {
          return { ...a };
        }
      ); // deep-copy associatedProductList
      $scope.selectedAssociatedProduct = null;
      $scope.associatedProductsEdited = false;
      clearSearchFields($scope);
      $scope.associatedProductsPanelOpen = true;
    };
    $scope.closeAssociatedProductsPanel = function () {
      const cb = function (result) {
        if (!result) return;
        $scope.associatedProductsPanelOpen = false;
        $scope.$apply();
      };

      if ($scope.associatedProductsEdited)
        confirm("Are you sure you want to discard the changes you made?", cb);
      else $scope.associatedProductsPanelOpen = false;
    };
    $scope.saveEditedAssociatedProducts = function () {
      if (!checkEditedAssociatedProducts()) {
        // nothing's changed
        $scope.associatedProductsPanelOpen = false;
        return;
      }
      mask();
      $http
        .post(
          `/production/genericproduct/update/${$scope.selectedGenericProduct.id}/associatedproducts`,
          {
            user: userService.username,
            token: userService.token,
            updatedAssociatedProducts: $scope.updatedAssociatedProducts,
          }
        )
        .then(
          function () {
            $scope.updatedAssociatedProducts.deleted.forEach((code) => {
              const i = $scope.allAssociatedProducts.findIndex(
                (a) => a.code == code
              );
              $scope.allAssociatedProducts.splice(i, 1); // delete the entry from the list
            });
            $scope.updatedAssociatedProducts.added.forEach((a) => {
              $scope.allAssociatedProducts.push({
                id: $scope.selectedGenericProduct.id,
                code: a.code,
                name: a.name,
                description: a.description,
              });
            });
            $scope.allAssociatedProducts.sort(compareCode);
            $scope.associatedProductList = $scope.allAssociatedProducts.filter(
              (a) => a.id == $scope.selectedGenericProduct.id
            );
            setTimeout(function () {
              unmask();
              notify("The associated products list was updated successfully.");
              $scope.associatedProductsPanelOpen = false;
              $scope.$apply();
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in saving the associated products list in the database."
            );
          }
        );
    };
    $scope.selectProduct = function (code) {
      const p = $scope.filteredProductList.find((p) => p.code == code);
      $scope.selectedProduct = !!p ? p : null; // because the function can be called by removeProduct() with a code that is not included in the list
      $scope.selectedAssociatedProduct = null;
    };
    $scope.selectAssociatedProduct = function (code) {
      $scope.selectedAssociatedProduct =
        $scope.editedAssociatedProductList.find((a) => a.code == code);
      $scope.selectedProduct = null;
    };
    $scope.addProduct = function () {
      const newProduct = {
        id: $scope.selectedGenericProduct.id,
        code: $scope.selectedProduct.code,
        name: $scope.selectedProduct.name,
        description: $scope.selectedProduct.description,
      };
      if (
        !$scope.editedAssociatedProductList.find(
          (a) => a.code == $scope.selectedProduct.code
        )
      ) {
        $scope.editedAssociatedProductList.push(newProduct);
        $scope.editedAssociatedProductList.sort(compareCode);
      }
      $scope.selectAssociatedProduct(newProduct.code);
      setTimeout(function () {
        autoScrollTable(
          ".selected-products table tbody",
          $scope.editedAssociatedProductList,
          $scope.selectedAssociatedProduct
        );
      }, 0);
      $scope.associatedProductsEdited = true;
    };
    $scope.removeProduct = function () {
      const i = $scope.editedAssociatedProductList.findIndex(
        (a) => a.code == $scope.selectedAssociatedProduct.code
      );
      $scope.editedAssociatedProductList.splice(i, 1); // delete $scope.selectedAssociatedProduct from the list
      $scope.selectProduct($scope.selectedAssociatedProduct.code);
      if (!!$scope.selectedProduct) {
        setTimeout(function () {
          autoScrollTable(
            ".products-to-select table tbody",
            $scope.filteredProductList,
            $scope.selectedProduct
          );
        }, 0);
      }
      $scope.associatedProductsEdited = true;
    };
    $scope.clear = function () {
      clearSearchFields($scope);
      $scope.search();
    };
    $scope.search = function () {
      searchProduct($scope);
    };

    entityData =
      userService.role == "SU"
        ? entityData.filter((e) => e.type == "PR")
        : entityData.filter((e) => e.code == userService.businessentity);
    entityData.sort(compareName);
    $scope.entityList = entityData;
    if ($scope.entityList.length == 1) {
      $scope.selectedEntity = $scope.entityList[0];
      $scope.entityFixed = true;
      $scope.entityChanged();
    } else {
      $scope.entityFixed = false;
      $scope.selectedEntity = null;
    }
    $scope.associatedProductsPanelOpen = false;
  };

  /*****************************************************************************************/
  const specialProgramsController = function (
    $scope,
    $state,
    $http,
    userService,
    entityData
  ) {
    const checkData = function () {
      if (!checkTextField($scope, "specialProgramCode", "Code", 10, true))
        return false;
      if (
        !checkTextField(
          $scope,
          "specialProgramDescription",
          "Description",
          40,
          false
        )
      )
        return false;
      if ($scope.specialProgramCode.includes(",")) {
        $scope.errMsg = "Code cannot have a comma(,) in it.";
        return false;
      }

      if ($scope.isNew) {
        $scope.newSpecialProgram = {
          entity: $scope.selectedEntity.code,
          code: $scope.specialProgramCode,
          description: $scope.specialProgramDescription,
        };
      } else {
        $scope.updatedSpecialProgram = {
          id: $scope.selectedSpecialProgram.id,
          entity: $scope.selectedEntity.code,
        };
        if ($scope.specialProgramCode != $scope.selectedSpecialProgram.code)
          $scope.updatedSpecialProgram.code = $scope.specialProgramCode;
        if (
          $scope.specialProgramDescription !=
          $scope.selectedSpecialProgram.description
        )
          $scope.updatedSpecialProgram.description =
            $scope.specialProgramDescription;
      }

      return true;
    };

    $scope.entityChanged = function () {
      if (!!$scope.selectedEntity) {
        mask();
        $http
          .post("/production/specialprograms", {
            user: userService.username,
            token: userService.token,
            entity: $scope.selectedEntity.code,
          })
          .then(
            function (res) {
              $scope.specialProgramList = res.data.rows;
              if ($scope.specialProgramList.length == 1) {
                $scope.selectSpecialProgram($scope.specialProgramList[0].id);
              } else {
                $scope.specialProgramList.sort(compareCode);
                $scope.selectedSpecialProgram = null;
                clearSpecialProgramDataFields($scope);
              }
              unmask();
            },
            function (err) {
              $scope.specialProgramList = [];
              $scope.selectedSpecialProgram = null;
              clearSpecialProgramDataFields($scope);
              unmask();
              alert(
                "There was an error in retrieving special programs data from the database."
              );
            }
          );
      } else {
        $scope.specialProgramList = [];
        $scope.selectedSpecialProgram = null;
      }
      $scope.isChanged = false;
      $scope.isNew = false;
    };
    $scope.selectSpecialProgram = function (id) {
      $scope.selectedSpecialProgram = $scope.specialProgramList.find(
        (s) => s.id == id
      );
      $scope.specialProgramCode = $scope.selectedSpecialProgram.code;
      $scope.specialProgramDescription =
        $scope.selectedSpecialProgram.description;

      $scope.isChanged = false;
      $scope.isNew = false;
    };
    $scope.new = function () {
      $scope.isNew = true;
      $scope.selectedSpecialProgram = null;
      clearSpecialProgramDataFields($scope);
      $scope.isChanged = false;
    };
    $scope.cancel = function () {
      const cb = function (result) {
        if (!result) return;

        clearSpecialProgramDataFields($scope);
        $scope.isChanged = false;
        if (!$scope.isNew) {
          const id = $scope.selectedSpecialProgram.id;
          $scope.selectedSpecialProgram = null;
          $scope.selectSpecialProgram(id);
        }
        $scope.$apply();
      };

      if (!$scope.isChanged) {
        $state.go("^");
      } else {
        confirm("Are you sure you want to discard all the changes?", cb);
      }
    };
    $scope.update = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(
          `/production/specialprogram/update/${$scope.selectedSpecialProgram.id}`,
          {
            user: userService.username,
            token: userService.token,
            updatedSpecialProgram: $scope.updatedSpecialProgram,
          }
        )
        .then(
          function () {
            if ($scope.updatedSpecialProgram.code !== undefined)
              $scope.selectedSpecialProgram.code =
                $scope.updatedSpecialProgram.code;
            if ($scope.updatedSpecialProgram.description !== undefined)
              $scope.selectedSpecialProgram.description =
                $scope.updatedSpecialProgram.description;

            $scope.selectSpecialProgram($scope.updatedSpecialProgram.id);
            setTimeout(function () {
              unmask();
              notify("The special program data was updated successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in updating the special program data in the database."
            );
          }
        );
    };
    $scope.delete = function () {
      const cb = function (result) {
        if (!result) return;

        mask();
        $http
          .post(
            `/production/specialprogram/delete/${$scope.selectedSpecialProgram.id}`,
            {
              user: userService.username,
              token: userService.token,
            }
          )
          .then(
            function () {
              $scope.specialProgramList.splice(
                $scope.specialProgramList.findIndex(
                  (s) => s.id == $scope.selectedSpecialProgram.id
                ),
                1
              ); // delete a special program
              $scope.selectedSpecialProgram = null;
              clearSpecialProgramDataFields($scope);
              setTimeout(function () {
                scrollUpTable(".special-program-list table tbody");
                unmask();
                notify("The special program data was deleted successfully.");
              }, 0);
            },
            function (err) {
              unmask();
              alert(
                "There was an error in deleting the special program data in the database."
              );
            }
          );
      };

      confirm(
        "Are you sure you want to delete the selected special program?",
        cb
      );
    };
    $scope.add = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post("/production/specialprogram/add", {
          user: userService.username,
          token: userService.token,
          newSpecialProgram: $scope.newSpecialProgram,
        })
        .then(
          function (res) {
            $scope.newSpecialProgram.id = res.data.rows[0].id; // id returned from INSERT
            $scope.specialProgramList.push($scope.newSpecialProgram);
            $scope.specialProgramList.sort(compareCode);
            $scope.selectSpecialProgram($scope.newSpecialProgram.id);
            setTimeout(function () {
              autoScrollTable(
                ".special-program-list table tbody",
                $scope.specialProgramList,
                $scope.selectedSpecialProgram,
                true
              );
              unmask();
              notify("The special program data was added successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in adding the special program data to the database. " +
                err.data.err
            );
          }
        );
    };

    entityData =
      userService.role == "SU"
        ? entityData.filter((e) => e.type == "PR")
        : entityData.filter((e) => e.code == userService.businessentity);
    entityData.sort(compareName);
    $scope.entityList = entityData;
    if ($scope.entityList.length == 1) {
      $scope.selectedEntity = $scope.entityList[0];
      $scope.entityFixed = true;
      $scope.entityChanged();
    } else {
      $scope.entityFixed = false;
      $scope.selectedEntity = null;
    }
  };

  /*****************************************************************************************/
  const workshopsController = function (
    $scope,
    $state,
    $http,
    userService,
    entityData,
    locationData
  ) {
    const checkData = function () {
      if (!checkTextField($scope, "workshopName", "Name", 20, true))
        return false;

      const idList = $scope.monitoringLocationList.map((m) => m.id);

      if ($scope.isNew) {
        $scope.newWorkshop = {
          location: $scope.selectedLocation.code,
          name: $scope.workshopName,
          monitoringLocations: idList.length > 0 ? idList : null,
        };
      } else {
        $scope.updatedWorkshop = {
          id: $scope.selectedWorkshop.id,
          location: $scope.selectedLocation.code,
        };
        if ($scope.workshopName != $scope.selectedWorkshop.name)
          $scope.updatedWorkshop.name = $scope.workshopName;

        if (
          JSON.stringify(idList) !==
          JSON.stringify(
            !!$scope.selectedWorkshop.monitoringlocations
              ? $scope.selectedWorkshop.monitoringlocations
              : []
          )
        )
          $scope.updatedWorkshop.monitoringLocations =
            idList.length > 0 ? idList : null;
      }

      return true;
    };

    $scope.entityChanged = function () {
      if (!!$scope.selectedEntity) {
        $scope.locationList = locationData.filter(
          (l) => l.entity == $scope.selectedEntity.code && l.op && !l.hq
        );
        if ($scope.locationList.length == 1) {
          $scope.selectedLocation = $scope.locationList[0];
        } else {
          $scope.selectedLocation = null;
        }
      } else {
        $scope.locationList = [];
        $scope.selectedLocation = null;
      }
      $scope.locationFixed =
        $scope.entityFixed && $scope.locationList.length == 1;
      $scope.locationChanged();
    };
    $scope.locationChanged = function () {
      if (!!$scope.selectedLocation) {
        mask();
        const p0 = $http.post("/production/workshops", {
          user: userService.username,
          token: userService.token,
          location: $scope.selectedLocation.code,
        });
        const p1 = $http.post("/temperature/location/monitoringlocations", {
          user: userService.username,
          token: userService.token,
          location: $scope.selectedLocation.code,
        });
        Promise.all([p0, p1]).then(
          function (res) {
            $scope.workshopList = res[0].data.rows;
            $scope.monitoringLocations = res[1].data.rows;
            if ($scope.workshopList.length == 1) {
              $scope.selectWorkshop($scope.workshopList[0].id);
            } else {
              $scope.selectedWorkshop = null;
              clearWorkshopDataFields($scope);
            }
            $scope.$apply();
            unmask();
          },
          function (err) {
            $scope.workshopList = [];
            $scope.monitoringLocations = [];
            $scope.selectedWorkshop = null;
            clearWorkshopDataFields($scope);
            $scope.$apply();
            unmask();
            alert(
              "There was an error in retrieving workshop data from the database."
            );
          }
        );
      } else {
        $scope.workshopList = [];
        $scope.selectedWorkshop = null;
      }
      $scope.isChanged = false;
      $scope.isNew = false;
    };
    $scope.selectWorkshop = function (id) {
      $scope.selectedWorkshop = $scope.workshopList.find((w) => w.id == id);
      $scope.workshopName = $scope.selectedWorkshop.name;
      if (!$scope.selectedWorkshop.monitoringlocations) {
        $scope.monitoringLocationList = [];
      } else {
        const ml = $scope.monitoringLocations.find((m) => m.id == id);
        $scope.monitoringLocationList =
          $scope.selectedWorkshop.monitoringlocations.map((id) => {
            const ml = $scope.monitoringLocations.find((m) => m.id == id);
            if (!!ml) return ml;
            else
              return {
                id: id,
                name: "(removed location)",
                inuse: false,
              };
          });
      }

      $scope.isChanged = false;
      $scope.isNew = false;
    };
    $scope.deleteMonitoringLocation = function (id) {
      $scope.monitoringLocationList.splice(
        $scope.monitoringLocationList.findIndex((m) => m.id == id),
        1
      ); // delete the selected monitoring location
      $scope.isChanged = true;
    };
    $scope.enterMonitoringLocation = function () {
      if (
        !$scope.monitoringLocationList.find(
          (m) => m.id == $scope.selectedMonitoringLocation.id
        )
      )
        $scope.monitoringLocationList.push($scope.selectedMonitoringLocation);
      $scope.selectedMonitoringLocation = null;
      $scope.isChanged = true;
    };
    $scope.new = function () {
      $scope.isNew = true;
      $scope.selectedWorkshop = null;
      clearWorkshopDataFields($scope);
      $scope.isChanged = false;
    };
    $scope.cancel = function () {
      const cb = function (result) {
        if (!result) return;

        clearWorkshopDataFields($scope);
        $scope.isChanged = false;
        if (!$scope.isNew) {
          const id = $scope.selectedWorkshop.id;
          $scope.selectedWorkshop = null;
          $scope.selectWorkshop(id);
        }
        $scope.$apply();
      };

      if (!$scope.isChanged) {
        $state.go("^");
      } else {
        confirm("Are you sure you want to discard all the changes?", cb);
      }
    };
    $scope.update = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post(`/production/workshop/update/${$scope.selectedWorkshop.id}`, {
          user: userService.username,
          token: userService.token,
          updatedWorkshop: $scope.updatedWorkshop,
        })
        .then(
          function () {
            if ($scope.updatedWorkshop.name !== undefined)
              $scope.selectedWorkshop.name = $scope.updatedWorkshop.name;
            if ($scope.updatedWorkshop.monitoringLocations !== undefined)
              $scope.selectedWorkshop.monitoringlocations =
                $scope.updatedWorkshop.monitoringLocations;

            $scope.selectWorkshop($scope.updatedWorkshop.id);
            setTimeout(function () {
              unmask();
              notify("The workshop data was updated successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in updating the workshop data in the database."
            );
          }
        );
    };
    $scope.delete = function () {
      const cb = function (result) {
        if (!result) return;

        mask();
        $http
          .post(`/production/workshop/delete/${$scope.selectedWorkshop.id}`, {
            user: userService.username,
            token: userService.token,
          })
          .then(
            function () {
              $scope.workshopList.splice(
                $scope.workshopList.findIndex(
                  (w) => w.id == $scope.selectedWorkshop.id
                ),
                1
              ); // delete a workshop
              $scope.selectedWorkshop = null;
              clearWorkshopDataFields($scope);
              setTimeout(function () {
                scrollUpTable(".workshop-list table tbody");
                unmask();
                notify("The workshop data was deleted successfully.");
              }, 0);
            },
            function (err) {
              unmask();
              alert(
                "There was an error in deleting the workshop data in the database."
              );
            }
          );
      };

      confirm("Are you sure you want to delete the selected workshop?", cb);
    };
    $scope.add = function () {
      if (!checkData()) {
        alert($scope.errMsg);
        return;
      }
      mask();
      $http
        .post("/production/workshop/add", {
          user: userService.username,
          token: userService.token,
          newWorkshop: $scope.newWorkshop,
        })
        .then(
          function (res) {
            $scope.newWorkshop.id = res.data.rows[0].id; // id returned from INSERT
            $scope.workshopList.push($scope.newWorkshop);
            $scope.selectWorkshop($scope.newWorkshop.id);
            setTimeout(function () {
              autoScrollTable(
                ".workshop-list table tbody",
                $scope.workshopList,
                $scope.selectedWorkshop,
                true
              );
              unmask();
              notify("The workshop data was added successfully.");
            }, 0);
          },
          function (err) {
            unmask();
            alert(
              "There was an error in adding the workshop data to the database. " +
                err.data.err
            );
          }
        );
    };

    entityData =
      userService.role == "SU"
        ? entityData.filter((e) => e.type == "PR" && e.num > 0)
        : entityData.filter(
            (e) => e.code == userService.businessentity && e.num > 0
          );
    entityData.sort(compareName);
    locationData.sort(compareName);
    $scope.entityList = entityData;
    if ($scope.entityList.length == 1) {
      $scope.selectedEntity = $scope.entityList[0];
      $scope.entityFixed = true;
      $scope.entityChanged();
    } else {
      $scope.entityFixed = false;
      $scope.selectedEntity = null;
      $scope.selectedLocation = null;
    }
  };

  productionZone.registerRoutes = function ($stateProvider) {
    return $stateProvider
      .state("home.production", {
        url: "production",
        views: {
          "main@": {
            templateUrl: "partials/production.html",
            controller: function ($scope, userService) {
              $scope.productionVisible =
                userService.role == "SU" || userService.entityType == "PR";
            },
          },
        },
        data: { displayName: "Production" },
        resolve: {
          entityData: function ($http, userService, $state) {
            return $http
              .post("/database/entities", {
                user: userService.username,
                token: userService.token,
              })
              .then(
                function (res) {
                  return res.data.rows;
                },
                function (err) {
                  BootstrapDialog.danger(
                    "Error in retrieving business entities data: " +
                      err.data.err
                  );
                  $state.go("login");
                  unmask();
                }
              );
          },
          locationData: function ($http, userService, $state) {
            return $http
              .post("/database/locations", {
                user: userService.username,
                token: userService.token,
              })
              .then(
                function (res) {
                  return res.data.rows;
                },
                function (err) {
                  BootstrapDialog.danger(
                    "Error in retrieving business locations data: " +
                      err.data.err
                  );
                  $state.go("login");
                  unmask();
                }
              );
          },
          productData: function ($http, userService, $state) {
            return $http
              .post("/database/products", {
                user: userService.username,
                token: userService.token,
              })
              .then(
                function (res) {
                  return res.data.rows;
                },
                function (err) {
                  BootstrapDialog.danger(
                    "Error in retrieving products data: " + err.data.err
                  );
                  $state.go("login");
                  unmask();
                }
              );
          },
        },
      })
      .state("home.production.dashboard", {
        url: "/dashboard",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.dashboard.html",
            controller: dashboardController,
          },
        },
        data: { displayName: "Dashboard" },
      })
      .state("home.production.lots", {
        url: "/lots",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.lots.html",
            controller: productionLotsController,
          },
        },
        data: { displayName: "Production Lots" },
      })
      .state("home.production.console", {
        url: "/console",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.console.html",
            controller: workshopConsoleController,
          },
        },
        data: { displayName: "Workshop Console" },
      })
      .state("home.production.logs", {
        url: "/logs",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.logs.html",
            controller: productionLogsController,
          },
        },
        data: { displayName: "Production Logs" },
      })
      .state("home.production.logs.info", {
        url: "/logs/info",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.logs.info.html",
            controller: productionLogInfoController,
          },
        },
        data: { displayName: "Detailed Log Info" },
      })
      .state("home.production.logs.info.production", {
        url: "/logs/info/production/:lotid/:product",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.logs.info.print.html",
            controller: productionLogInfoPrintController,
          },
        },
        data: { displayName: "Production Output" },
      })
      .state("home.production.logs.info.shipping", {
        url: "/logs/info/shipping/:location/:shipmentid/:palletid",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.logs.info.print.html",
            controller: productionLogInfoPrintController,
          },
        },
        data: { displayName: "Shipping Manifest" },
      })
      .state("home.production.logs.info.consumption", {
        url: "/logs/info/consumption/:lotid",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.logs.info.print.html",
            controller: productionLogInfoPrintController,
          },
        },
        data: { displayName: "Consumption Log" },
      })
      .state("home.production.inputoutput", {
        url: "/inputoutput",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.inputoutput.html",
            controller: inputOutputController,
          },
        },
        data: { displayName: "Input & Output" },
      })
      .state("home.production.genericproducts", {
        url: "/genericproducts",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.genericproducts.html",
            controller: genericProductsController,
          },
        },
        data: { displayName: "Generic Products" },
      })
      .state("home.production.specialprograms", {
        url: "/specialprograms",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.specialprograms.html",
            controller: specialProgramsController,
          },
        },
        data: { displayName: "Special Programs" },
      })
      .state("home.production.workshops", {
        url: "/workshops",
        views: {
          "sub@home.production": {
            templateUrl: "partials/production.workshops.html",
            controller: workshopsController,
          },
        },
        data: { displayName: "Workshops" },
      });
  };
})();
