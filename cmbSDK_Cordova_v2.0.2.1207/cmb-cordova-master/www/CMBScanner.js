cordova.define("cmb-sdk-cordova-plugin.Scanner", function(require, exports, module) {
 /**
*   version 1.2.2
*   -  iOS small fixes
*   version 1.2.1
*   -  iOS MX-100 improvements
*   -  Android scan image result fixes
*   version 1.2.0
*   -  Added missing architecture libs
*   -  fixed different symbology index numbers on android and ios platforms
*   -  Added AAR for android support instead of JAR and SO
*   -  MX - 100 support added for ios only
*   version 1.1.2
*   - added setPreviewOptions. See CONSTANTS.PREVIEW_OPTIONS
*   - added setTriggerType(). Sets how we handle the closing of the scanner after a result has been received. See: TRIGGER_TYPES
*   - removed setDeviceType; Moved the device selection to loadScanner
*   - changed how loadScanner works on native Side, it doesn't connect to the device by default,
      we now have to call mwbScanner.connect() after loadScanner finishes loading
*   - changed the callback nature of loadScanner, it now returns a proper callback
*   - changed the callback nature of startScanning and stopScanning, they now do not return a callback at all instead we need to listen
to startStop event by setting the setActiveStartScanningCallback(callback)
    - removed the redundant "var callback" redeclaring of the parameters
*
* version 1.1.1
    - Added promise support for
        isSymbologyEnabled, setSymbologyEnabled, getConnectionState, setCommand

    - getConnectionState saves the callback function so when we call getConnectionState() it reuses the old
    - changed the name of the function setConnectionState to setConnectionStateDidChangeOfReaderCallback to be more consistent with the native side
    - changed the CONSTANT names for SYMBOLS, from plain variables to an object for easy access
    - fixed the symbology CONSTANTS starting from index 0 for DataMatrix instead of 1

* version 1.1.0
*   - Removed overhead callbacks
*   - Fixed startScanning not setting the callback properly
*
*
**/

/** START CONSTANTS **/
var CONSTANTS = {

/**
* @{
*/
//code here

/**
* @brief  DeviceType :  Device to connect to.
*/
DEVICES : ["DEVICE_TYPE_MX_1000","DEVICE_TYPE_MOBILE_DEVICE"],
DEVICES_FRIENDLY : ["MX Device","Camera"],

TRIGGER_TYPES : ["","","MANUAL_TRIGGER","","","CONTINUOUS_TRIGGER"],
// DEVICE_TYPE_MX_1000 :  0,
// DEVICE_TYPE_MOBILE_DEVICE :  1,
/**/

/**
* @brief  Availability :  Device availability.
*/
AVAILABILITY_UNKNOWN :  0,
AVAILABILITY_AVAILABLE :  1,
AVAILABILITY_UNAVAILABLE :  2,
/**/

/**
* @brief  ConnectionState :  Indicates the connection state of a DataManSystem object.
*/
CONNECTION_STATE_DISCONNECTED :  0,
CONNECTION_STATE_CONNECTING :  1,
CONNECTION_STATE_CONNECTED :  2,
CONNECTION_STATE_DISCONNECTING :  3,
/**/

/**
*   @brief CAMERA MODES
*/
CAMERA_MODES : ["NO_AIMER","PASSIVE_AIMER","ACTIVE_AIMER","FRONT_CAMERA"],
/**/

/**
Use camera with no aimer. Preview is on, illumination is available.
NO_AIMER = 0,

Use camera with a basic aimer (e.g., StingRay). Preview is off, illumination is not available.
PASSIVE_AIMER = 1,

Use camera with an active aimer (e.g., MX-100). Preview is off, illumination is available.
ACTIVE_AIMER = 2,

Use mobile device front camera. Preview is on, illumination is not available.
FRONT_CAMERA = 3
*/


PREVIEW_OPTIONS : {
/**
 * Use defaults (no overrides).
 */
"DEFAULTS" : 0,
/**
 * Disable zoom feature (removes zoom button from preview).
 */
"NO_ZOOM_BTN" : 1,
/**
 * Disable illumination (removes illumination button from preview).
 */
"NO_ILLUM_BTN" : 2,
/**
 * Enables the simulated hardware trigger (the volume down button).
 */
"HARDWARE_TRIGGER" : 4,
/**
 * When scanning starts, the preview is displayed but decoding is paused until a trigger (either the on screen button or the volume down button, if enabled) is pressed.
 */
"PREVIEW_PAUSED" : 8,
/**
 * Force the preview to be displayed, even if off by default (e.g., when using kCDMCameraModePassiveAimer or kCDMCameraModeActiveAimer).
 */
"PREVIEW_ALWAYS_SHOW" : 16
},

/**
* @brief
* The type of result that is returned to the didReceiveReadResultFromReaderCallback
*/
RESULT_TYPES : {
      "NONE"              : 0,
      "READ_STRING"       : 1,
      "READ_XML"          : 2,
      "XML_STATISTICS"    : 4,
      "IMAGE"             : 8,
      "IMAGE_GRAPHICS"    : 16,
      "TRAINING_RESULTS"  : 32,
      "CODE_QUALITY_DATA" : 64

},

/**
* @brief  Symbology :  Barcode symbology to use.
*
*/

SYMBOLS : {
       "SYMBOL.UNKNOWN"            : 0
      ,"SYMBOL.DATAMATRIX"         : 1
      ,"SYMBOL.QR"                 : 2
      ,"SYMBOL.C128"               : 3
      ,"SYMBOL.UPC-EAN"            : 4
      ,"SYMBOL.C11"                : 5
      ,"SYMBOL.C39"                : 6
      ,"SYMBOL.C93"                : 7
      ,"SYMBOL.I2O5"               : 8
      ,"SYMBOL.CODABAR"            : 9
      ,"SYMBOL.EAN-UCC"            : 10
      ,"SYMBOL.PHARMACODE"         : 11
      ,"SYMBOL.MAXICODE"           : 12
      ,"SYMBOL.PDF417"             : 13
      ,"SYMBOL.MICROPDF417"        : 14
      ,"SYMBOL.DATABAR"            : 15
      ,"SYMBOL.POSTNET"            : 16
      ,"SYMBOL.PLANET"             : 17
      ,"SYMBOL.4STATE-JAP"         : 18
      ,"SYMBOL.4STATE-AUS"         : 19
      ,"SYMBOL.4STATE-UPU"         : 20
      ,"SYMBOL.4STATE-IMB"         : 21
      ,"SYMBOL.VERICODE"           : 22
      ,"SYMBOL.RPC"                : 23
      ,"SYMBOL.MSI"                : 24
      ,"SYMBOL.AZTECCODE"          : 25
      ,"SYMBOL.DOTCODE"            : 26
      ,"SYMBOL.C25"                : 27
      ,"SYMBOL.C39-CONVERT-TO-C32" : 28
      ,"SYMBOL.OCR"                : 29
      ,"SYMBOL.4STATE-RMC"         : 30
}

/** @} */

};

/** END CONSTANTS **/

var serviceClass = "CMBScanner";


var DEFAULT_CALLBACKS = {


    /**
    *   @name : scanResultCallback
    *   @desc : After receiving a read result from a barcode, the result is returned to resultCallback.
    *   This handler is set as default callback for loadScanner, startScanning and stopScanning.
    */
    scanResultCallback : function(result) {
        /**
        * result.symbology - string representation of the barcode symbology detected
        * result.readString - string representation of the read
        */
        if (result.symbology == 'NO READ') {
            //Perform some action when no barcode is read
        }
        else if (result && result.readString) {
            //Perform some action on barcode read
            //example:
            navigator.notification.alert(result.readString, function(){}, result.symbology, '');
        }
        return result; //scanResultCallback gets wrapped in a promise, and we need to return for the promise chain
    },

    /**
    *
    *   @name : availabilityCallback
    *   @desc : After calling getAvailability, the result is returned to availabilityHandler.
    *
    */
    availabilityCallback: function(availability) {
        /**
        * availability - int representation of the Device availability
        */
        if (availability == CONSTANTS.AVAILABILITY_UNKNOWN) {
            //Perform some action when device availability is not known
        }
        else if (availability == CONSTANTS.AVAILABILITY_AVAILABLE) {
            //Perform some action when device is available
        }
        else if (availability == CONSTANTS.AVAILABILITY_UNAVAILABLE) {
            //Perform some action when device is not available
        }
    },


    /**
    * After calling getConnectionState, connect or disconnect, the connection state change
    * is reported to connectionStateHandler.
    */
    connectionStateDidChangeOfReaderCallback: function(connectionState) {
        /**
        * connectionState - int representation of the DataManSystem object connection state
        */
        if (connectionState == CONSTANTS.CONNECTION_STATE_DISCONNECTED) {
            //Perform some action when the DataManSystem object is not connected to any remote system.
        }
        else if (connectionState == CONSTANTS.CONNECTION_STATE_CONNECTING) {
            //Perform some action when the DataManSystem object is
            //in the process of establishing a connection to a remote system.
        }
        else if (connectionState == CONSTANTS.CONNECTION_STATE_CONNECTED) {
            //Perform some action when the DataManSystem object is connected to a remote system.
        }
        else if (connectionState == CONSTANTS.CONNECTION_STATE_DISCONNECTING) {
            //Perform some action when the DataManSystem object is
            //in the process of disconnecting from a remote system.
        }
        return connectionState;
    }

};



var BarcodeScanner = {

/**
* Start scanner with default params in a native activity
*
*/
CMBloadScanner: function(deviceType,callback) {
    cordova.exec(callback, function(){}, serviceClass, "loadScanner", [deviceType]);
},

/**
* Sets a function for the CMBReaderDevice didReceiveReadResultFromReader callbacks.
*/
CMBsetResultCallback: function(callback) {
   cordova.exec(callback, function(){}, serviceClass, "didReceiveReadResultFromReaderCallback", []);
},

/**
* Sets a function for the CMBReaderDevice availabilityDidChangeOfReader callbacks.
*/
CMBsetAvailabilityCallback: function(callback) {

   cordova.exec(callback, function(){}, serviceClass, "availabilityDidChangeOfReaderCallback", []);
},

/**
* Sets a function for the CMBReaderDevice connectionStateDidChangeOfReader callbacks.
*/
CMBsetConnectionStateDidChangeOfReaderCallback: function(callback) {
   cordova.exec(callback, callback, serviceClass, "connectionStateDidChangeOfReaderCallback", []);
},



CMBsetActiveStartScanningCallback : function(callback){
   cordova.exec(callback, callback, serviceClass, "setActiveStartScanningCallback", []);
},



/**
* Set the position and size of the preview container.
* ONLY AVAILABLE ON MX-Mobile
* Values are percentages of the screen.
*/
CMBsetPreviewContainerPositionAndSize: function(x, y, width, height) {
   cordova.exec(function(){}, function(){}, serviceClass, "setPreviewContainerPositionAndSize", [x, y, width, height]);
},

//export all easySDK / Reader device classes here

/**
* Retrieves the availability of the reader.
*/
CMBgetAvailability: function(callback) {
    cordova.exec(callback, function(){}, serviceClass, "getAvailability", []);
},

/**
* Enable or disable image results from reader
* @param enable true to enable image results
*/
CMBenableImage: function(enable) {
    cordova.exec(function(){}, function(){}, serviceClass, "enableImage", [enable]);
},

/**
* Enable or disable SVG image graphics results from reader
* @param enable true to enable image graphics results
*/
CMBenableImageGraphics: function(enable) {
    cordova.exec(function(){}, function(){}, serviceClass, "enableImageGraphics", [enable]);
},

/**
* Retrieves the current connection state of the reader.
*/
CMBgetConnectionState: function(callback) {
    cordova.exec(callback, callback, serviceClass, "getConnectionState", []);
},

/**
*
*
*/
CMBsetPreviewOptions: function(previewOptions){

  cordova.exec(function(){}, function(){}, serviceClass, "setPreviewOptions", [previewOptions]);

},

/**
* Initiates a connection to the device.
* After the connection completes, {@link OnConnectionCompletedListener} is invoked.
*/
CMBconnect: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "connect", []);
},

/**
* Initiates registration.
* @param key license key
*/
CMBregisterSDK: function(key) {
    cordova.exec(function(){}, function(){}, serviceClass, "registerSDK", [key]);
},

/**
* Initiates a disconnection from the device.
* TODO: @zikam I can't see where this is used
*/
CMBdisconnect: function(successCallback,errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "disconnect", []);
},

/**
* Starts triggering.
*/
CMBstartScanning: function(callback,errorCallback) {
    cordova.exec(callback, errorCallback, serviceClass, "startScanning", []);
},

/**
* Stops triggering.
*/
CMBstopScanning: function(callback,errorCallback) {
    cordova.exec(callback, errorCallback, serviceClass, "stopScanning", []);
},

/**
* Plays a beep on the reader.
*/
CMBbeep: function() {
    cordova.exec(function(){}, function(){}, serviceClass, "beep", []);
},

/**
* Retrieves the current battery percentage level of the reader.
*/
CMBgetDeviceBatteryLevel: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "getDeviceBatteryLevel", []);
},

/**
* Enable or disable a symbology on the reader.
* @param symbology The symbology to enable or disable
* @param enable true to enable, false to disable
*/
CMBsetSymbologyEnabled: function(symbology, enable, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "setSymbologyEnabled", [symbology, enable]);
},

/**
* Retrieves the current state (enabled/disabled) of the specified symbology.
* @param symbology The {@link Symbology} to check
* @param listener The callback to be invoked as the result is available
*/
CMBisSymbologyEnabled: function(symbology, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "isSymbologyEnabled", [symbology]);
},

/**
* Enables or disables all lights of the reader.
* @param on true to enable the lights
*/
CMBsetLightsOn: function(on, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "setLightsOn", [on]);
},

/**
* Retrieves the current state of the lights.
*/
CMBisLightsOn: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "isLightsOn", []);
},

/**
* Resets the device configuration to factory defaults.
*/
CMBresetConfig: function(successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "resetConfig", []);
},

/**
* Sends a command to the connected device with the default timeout.
*/
CMBsendCommand: function(commandString, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, serviceClass, "sendCommand", [commandString]);
},
/*
*   setCameraMode
**/
CMBsetCameraMode : function(cameraMode){
    cordova.exec(function(){}, function(){}, serviceClass, "setCameraMode", [cameraMode]);
}
};

var Scanner = function(){

    this.activeResultCallback = DEFAULT_CALLBACKS.scanResultCallback;
    this.activeStartScanning = false;
    this.activeConnectionCallback = function(result){return result;}
    this.activeAvailabilityCallback = function(result){return result;}
};

/**
*   @name : loadScanner
*   @desc : This function initalizes a ReaderDevice (based on the deviceType)
*   @date : 1/2/2018
*   @params: callback to use when the scanner has been initialized
*   @return :  Result object
            {
                const (string)action : which action was taken, will always return LOAD READER
                (string)result : the message from the server
                (bool) status : if the reader was loaded it will return true
                (string) err : the string error if an error was thrown
                (int) type :  the type of the device that we connected to [0,1]
                (string) name : the name of the type of device DEVICES[type]
            }
*   NOTE: loadScanner will not connect() to the device, it will just prepare the Reader
*         for connections
*
*/
Scanner.prototype.loadScanner = function(deviceType,callback){

    if(typeof deviceType === 'function'){
        callback = deviceType;
        deviceType = 0;
    }
    if(typeof deviceType === "string"){
        deviceType = CONSTANTS.DEVICES.indexOf(deviceType);
    }

    callback = (typeof callback === 'function') ? callback : function(result){return result;};
    var deviceTypeName = CONSTANTS.DEVICES[deviceType];

    return (function(){
        return new Promise(function(resolve,reject){
                    var rr = {
                        action : "LOAD READER",
                        result : "",
                        status : false,
                        err : null
                    };
                    if(!deviceTypeName){
                        result.err = "Invalid Device, should be either 0 or 1";
                        resolve(result);
                    }
                    else{
                        BarcodeScanner.CMBloadScanner(deviceType,function(msg){
                            rr.status = true;
                            rr.result = msg;
                            rr.type = deviceType;
                            rr.name = deviceTypeName;
                            resolve(rr);
                        });
                    }
                })
        })()
        .then(callback) //call the callback if it has been set with a traditional method as a parameter
        .catch(callback); //catch unhandled errors here
};

/**
*   @author : @lazyvlad
*   @date   : 1/6/2018
*   @name   :  setResultCallback
*   @desc   : It sets the default callback that will be used when returning from a succesful scan
*   @params : traditional callback (doesn't return a Promise)
**/
Scanner.prototype.setResultCallback = function(callback){
    callback = (typeof callback === 'function') ? callback : DEFAULT_CALLBACKS.scanResultCallback;
    this.activeResultCallback = callback;
    BarcodeScanner.CMBsetResultCallback(callback);
};


/**
*   @author : @lazyvlad
*   @date   : 1/6/2018
*   @name   : setAvailabilityCallback
*   @desc   : Set the callback that listens on availability change state events
*   @params : traditional callback (doesn't return a Promise)
**/
Scanner.prototype.setAvailabilityCallback = function(callback){
           callback = (typeof callback === 'function') ? callback : DEFAULT_CALLBACKS.availabilityCallback;
           BarcodeScanner.CMBsetAvailabilityCallback(callback);
};
/**
*    @author : @lazyvlad
*    @date   : 1/3/2018
*    @name   : setConnectionStateDidChangeOfReaderCallback
*    @params : callback - traditional callback
*    @return : connectionState in int [0,1,2,3] or string for err
*
*/
Scanner.prototype.setConnectionStateDidChangeOfReaderCallback = function(callback){

    callback = (typeof callback === 'function') ? callback : DEFAULT_CALLBACKS.connectionStateDidChangeOfReaderCallback;
    BarcodeScanner.CMBsetConnectionStateDidChangeOfReaderCallback(callback);

};

/**


*    @name   : setPreviewContainerPositionAndSize
*    @params : x,y,w,h (x,y) top left position; (w,h) width and height in percentages
*    @return : set the size and position of the container that will hold our preview
*
*/
Scanner.prototype.setPreviewContainerPositionAndSize = function(x, y, w, h){

    x = (typeof parseInt(x) === 'number')?parseInt(x):0;
    y = (typeof parseInt(y) === 'number')?parseInt(y):0;
    w = (typeof parseInt(w) === 'number')?parseInt(w):100;
    h = (typeof parseInt(h) === 'number')?parseInt(h):35;

    BarcodeScanner.CMBsetPreviewContainerPositionAndSize(x, y, w, h);
};

/**
*   @author @lazyvlad
*   @date 1/2/2018
*   @name: setCameraMode
*   @desc:  set the camera mode
*   @params: (int) cameraMode ; possible values 0,1,2,3
*
*/
Scanner.prototype.setCameraMode = function(cameraMode){
    let cameraModeName = CONSTANTS.CAMERA_MODES[cameraMode];

    if(!cameraModeName){
        console.log('Invalid Camera Mode [0,1,2,3]');
    }

    BarcodeScanner.CMBsetCameraMode(cameraMode);


}

/**
*   @author @lazyvlad
*   @date 1/6/2018
*   @name: getAvailability
*   @desc: Get the availability of the device and return a Promise
*   @params: (function) traditional callback wrapped into Promise
*   @note : callback is saved, so next time we call the function we don't have to set it
*
*/
Scanner.prototype.getAvailability = function(callback){



    callback = (typeof callback === 'function') ? callback : false;

    if(!callback){
        callback = this.activeAvailabilityCallback;
    } else {
        // save the connection so when we use the function without a callback it will be reused
        this.activeAvailabilityCallback = callback;
    }

    return (function(){
        return new Promise(function(resolve,reject){
                    BarcodeScanner.CMBgetAvailability(function(result){
                        resolve(result);
                    });
                });
        })()
        .then(callback)
        .catch(callback);

};
/**
*   @name : enableImage
*   @desc : enables / disables the DATA.RESULT_TYPE : 8
*
*/
Scanner.prototype.enableImage = function(enable){


    enable = (enable) ? true : false;
    BarcodeScanner.CMBenableImage(enable);

};
/**
*   @name : enableImageGraphics
*   @desc : enables / disables the DATA.RESULT_TYPE : 16
*
*/
Scanner.prototype.enableImageGraphics = function(enable){

    enable = (enable) ? true : false;
    BarcodeScanner.CMBenableImageGraphics(enable);
};


/**
*   @author @lazyvlad
*   @date 1/1/2018
*   @name: setPreviewOptions
*   @desc:  set the preview options described in the CONSTANTS section
*   @params:
        previewOptions : integer value representing the sum of all the PREVIEW_OPTIONS that we want to enable
        (ORed values)

*
*/
Scanner.prototype.setPreviewOptions = function(previewOptions){
  BarcodeScanner.CMBsetPreviewOptions(previewOptions);
}

/**
*   @author @lazyvlad
*   @date 1/1/2018
*   @name: getConnectionState
*   @desc:  Get the connection status, we can scan barcodes only after we have a DEVICE connectino
*   @params: (function) traditional callback
*
*/
Scanner.prototype.getConnectionState = function(callback){

    callback = (typeof callback === 'function') ? callback : false;

    if(!callback){
        callback = this.activeConnectionCallback;
    } else {
        // save the connection so when we use the function without a callback it will be reused
        this.activeConnectionCallback = callback;
    }


    return (function(){
        return new Promise(function(resolve,reject){
                    BarcodeScanner.CMBgetConnectionState(function(result){
                        resolve(result);
                    });
                });
        })()
        .then(callback)
        .catch(callback);

};

/**
*   @author     : @lazyvlad
*   @date       : 1/3/2018
*   @name       : connect
*   @desc       : Connect from the Reader Device
*   @params     : (function) traditional callback that's transformed to a Promise
    @return     : A promise that contains the result of the call.
    @note: To listen for connectionState changes we need to listen to
            connectionStateDidChangeOfReaderCallback which is called whenever there is a change
             in the connection State.
            "callback" will not return the actual state of the connection, but rather the result
            of the action (the programmer will have access to the exact moment connect was called)
*/
Scanner.prototype.connect = function(callback){
        callback = (typeof callback === 'function') ? callback : function(actionResult) {
        return actionResult;
    };
    let rr = {
      status : true,
      err : null
    };
    return (function(){
        return new Promise(function(resolve,reject){
                    BarcodeScanner.CMBconnect(function(result){
                        resolve({
                            status : true,
                            err : null
                        });

                    },function(err){
                        rr.status = false;
                        rr.err = err;
                        resolve(rr);
                    });
                });
        })()
        .then(callback)
        .catch(callback);
};

/**
*   @author     : @marko
*   @date       : 2/4/2018
*   @name       : register
*   @desc       : Register sdk
*/
Scanner.prototype.registerSDK = function(key){

    BarcodeScanner.CMBregisterSDK(key);
};

/**
*   @author     : @lazyvlad
*   @date       : 1/3/2018
*   @name       : disconnect
*   @desc       : Disconnect from the Reader Device
*   @params     : (function) traditional callback that's transformed to a Promise
    @return     : A promise that contains the result of the call.
    @note: To listen for connectionState changes we need to listen to
            connectionStateDidChangeOfReaderCallback which is called whenever there is a change
             in the connection State.
            "callback" will not return the actual state of the connection, but rather the result
            of the action (the programmer will have access to the exact moment disconnect was called)

*/
Scanner.prototype.disconnect = function(callback){

    callback = (typeof callback === 'function') ? callback : function(actionResult) {
        return actionResult;
    };

    return (function(){
        return new Promise(function(resolve,reject){
                BarcodeScanner.CMBdisconnect(function(result){
                    resolve(result);
                },function(err){
                    resolve(err);
                });
            });
        })()
        .then(callback)
        .catch(callback);
};

/**
*   @author     : @lazyvlad
*   @date       : 1/3/2018
*   @name       : setActiveStartScanningCallback
*   @desc       : Set the callback when start/stop Scanning is invoked
*   @params     : (function) traditional callback that's transformed to a Promise. It's required

*/
Scanner.prototype.setActiveStartScanningCallback = function(callback){

    callback = (typeof callback === 'function') ? callback : function(result){
      if(result){
        // console.log("scanner active");
      }
      else{
        // console.log("scanner off");
      }
    }
    this.activeStartScanning = callback;
    BarcodeScanner.CMBsetActiveStartScanningCallback(callback);

}

/**
*       @author     : @lazyvlad
*       @date       : 1/3/2018
*       @name: startScanning
*       @desc: start the Scanning process
*              (optional callback) will overwrite the activeStartScanningCallback only if it isn't set already
**/
Scanner.prototype.startScanning = function(callback){


    callback = (typeof callback === 'function') ? callback : false;

    //only change the active scanning callback if it's not set
    if(!(this.activeStartScanning && typeof this.activeStartScanning === 'function')){
      if(!callback){
        this.activeStartScanning = function(result){
          if(result){
            // console.log("scanner active");
          }
          else{
            // console.log("scanner off");
          }
        };
      }
      else{
        this.activeStartScanning = callback;
      }
      BarcodeScanner.CMBsetActiveStartScanningCallback(this.activeStartScanning);
    }

    BarcodeScanner.CMBstartScanning();

};


/**
*   @name: stopScanning
*   @desc: Stop the scanning process, notify the DOM elements that the scanner is not active
*   @params : (optional) traditional callback
*             will overwrite the activeStartScanningCallback only if it isn't set
*
**/
Scanner.prototype.stopScanning = function(callback){

    callback = (typeof callback === 'function') ? callback : false;

    //only change the active scanning callback if it's not set
    if(!(this.activeStartScanning && typeof this.activeStartScanning === 'function')){
      if(!callback){
        this.activeStartScanning = function(result){

          return result;
        };
      }
      else{
        this.activeStartScanning = callback;
      }
      BarcodeScanner.CMBsetActiveStartScanningCallback(this.activeStartScanning);
    }

    BarcodeScanner.CMBstopScanning();

};
/**
*   @author @lazyvlad
*   @date 1/5/2018
*   @name: getDeviceBatteryLevel
*   @desc:  get the battery level
*   @params: (string) symbol - string representation of the symbol as defined in the reference for DMCC symbols (see SYMBOL.*)
             (bool) toggle - true/false if the symbology should be enabled or disabled
             (function) traditional callback
    @return A promise that contains the JSON object
            {
                action  : the DMCC command that was invoked
                status  : did it succeed or not, if an error happened it will be set to false
                charge  : (int) the charge in percentage
                err     : the error message if the action didn't complete
            }
*/
Scanner.prototype.getDeviceBatteryLevel = function(callback){

    callback = (typeof callback === 'function') ? callback : function(result){return result;};

    return (function(){
        return new Promise(function(resolve,reject){
                    var result = {
                        action : "GET BATTERY.CHARGE",
                        status : false,
                        err : null
                    };

                    BarcodeScanner.CMBgetDeviceBatteryLevel(function(charge){
                        result.status = true;
                        result.charge = charge;
                        resolve(result);
                    }, function(err){
                        result.err = err;
                        resolve(result);
                    });

                })
        })()
        .then(callback) //call the callback if it has been set with a traditional method as a parameter
        .catch(callback); //catch unhandled errors here

};


/**
*   @author @lazyvlad
*   @date 1/1/2018
*   @name: setSymbologyEnabled
*   @desc:  Set a symbol on/off
*   @params: (string) symbol - string representation of the symbol as defined in the reference for DMCC symbols (see SYMBOL.*)
             (bool) toggle - true/false if the symbology should be enabled or disabled
             (function) traditional callback
    @return A promise that contains the JSON object
            {
                action  : the DMCC command that was invoked
                status  : did it succeed or not, if an error happened it will be set to false
                err     : the error message if the action didn't complete
            }
*/
Scanner.prototype.setSymbologyEnabled = function(symbol,toggle,callback){

    callback = (typeof callback === 'function') ? callback : function(result){return result;};
    var int_symbol = CONSTANTS.SYMBOLS[symbol];
    var on_off = toggle ? " ON" : " OFF";

    return (function(){
        return new Promise(function(resolve,reject){
                    var result = {
                        action : "SET " + symbol + on_off,
                        status : false,
                        err : null
                    };

                    if(!int_symbol){
                        result.err = "Invalid Symbol";
                        resolve(result);
                    }
                    else{
                        BarcodeScanner.CMBsetSymbologyEnabled(int_symbol, toggle, function(){
                            result.status = true;
                            resolve(result);
                        }, function(err){
                            result.err = err;
                            resolve(result);
                        });
                    }
                })
        })()
        .then(callback) //call the callback if it has been set with a traditional method as a parameter
        .catch(callback); //catch unhandled errors here
}


/**
*   @author @lazyvlad
*   @date 1/1/2018
*   @name: isSymbologyEnabled
*   @desc:  Set a symbol on/off
*   @params: (string) symbol - string representation of the symbol as defined in the reference for DMCC symbols (see SYMBOL.*)
             (function) traditional callback
    @return A promise that contains the JSON object
            {
    (string)    action  : the DMCC command that was invoked
         (bool) result  : the 1/0 value returned from the method
         (bool) status  : did it succeed or not, if an error happened it will be set to false
                err     : the error message if the action didn't complete
            }
*/
Scanner.prototype.isSymbologyEnabled = function(symbol, callback){

    callback = (typeof callback === 'function') ? callback : function(result){return result;};
    var int_symbol = CONSTANTS.SYMBOLS[symbol];


    return (function(){
        return new Promise(function(resolve,reject){
                    var result = {
                        action : "GET " + symbol,
                        result : 0,
                        status : false,
                        err : null
                    };

                    if(!int_symbol){
                        result.err = "Invalid Symbol";
                        resolve(result);
                    }
                    else{
                        BarcodeScanner.CMBisSymbologyEnabled(int_symbol, function(ise){
                            result.status = true;
                            result.result = ise;
                            resolve(result);
                        }, function(err){
                            result.err = err;
                            resolve(result);
                        });
                    }
                })
        })()
        .then(callback) //call the callback if it has been set with a traditional method as a parameter
        .catch(callback); //catch unhandled errors here

};
/**
*   @author @lazyvlad
*   @date 1/1/2018
*   @name: sendCommand
*   @desc:  Send a command to be executed on our device
*   @params: (string) commandString - string representation of the command. See wiki for valid commands
*      URL: https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-android/appendix-a-dmcc-for-the-camera-reader
            or:
            https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-ios/appendix-a-dmcc-for-the-camera-reader-ios

             (function) traditional callback
    @return A promise that contains the JSON object
            {
    (string)    action  : the DMCC command that was invoked
         (bool) status  : did it succeed or not, if an error happened it will be set to false
                err     : the error message if the action didn't complete
                result  : the result of the action
            }
*/
Scanner.prototype.sendCommand = function(commandString, callback){


    callback = (typeof callback === 'function') ? callback : function(result){return result;};

    return (function(){
        return new Promise(function(resolve,reject){
                    var rr = {
                        action : commandString,
                        status : false,
                        err : null
                    };

                    if (!(typeof commandString === 'string')) {
                        rr.err = "commandString is not a String";
                        resolve(result);
                    }
                    else{
                        BarcodeScanner.CMBsendCommand(commandString, function(result){
                            rr.status = true;
                            rr.result = result;
                            resolve(rr);
                        }, function(err){
                            rr.err = err;
                            resolve(rr);
                        });
                    }
                })
        })()
        .then(callback)
        .catch(callback);

};
/**
*   @author @lazyvlad
*   @date 1/6/2018
*   @name: setTriggerType
*   @desc:  Set the trigger type of our Reader
*   @params: (int) trigger - int [2,5]
*      URL: https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-android/appendix-a-dmcc-for-the-camera-reader
            or:
            https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-ios/appendix-a-dmcc-for-the-camera-reader-ios

             (function) traditional callback
    @return A promise that contains the JSON object
            {
    (string)    action  : the DMCC command that was invoked
         (bool) status  : did it succeed or not, if an error happened it will be set to false
                err     : the error message if the action didn't complete
            }
*/
Scanner.prototype.setTriggerType = function(trigger,callback){

    callback = (typeof callback === 'function') ? callback : function(result){return result;};

    var triggerTypeName = CONSTANTS.TRIGGER_TYPES[trigger];

    var commandString = "SET TRIGGER.TYPE " + trigger;

    return (function(){
        return new Promise(function(resolve,reject){
                    var rr = {
                        action : commandString,
                        status : false,
                        trigger : trigger,
                        err : null
                    };

                    if (!triggerTypeName) {
                        rr.err = "Unsupported Trigger Type";
                        resolve(result);
                    }
                    else{
                        BarcodeScanner.CMBsendCommand(commandString, function(result){
                            rr.status = true;
                            rr.result = result;
                            resolve(rr);
                        }, function(err){
                            rr.err = err;
                            resolve(rr);
                        });
                    }
                })
        })()
        .then(callback)
        .catch(callback);

};
/**
*   @author @lazyvlad
*   @date 1/6/2018
*   @name: setLightsOn
*   @desc: Set the flash unit ON/OFF
*   @params: (bool) on - on/off
*      URL: https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-android/appendix-a-dmcc-for-the-camera-reader
            or:
            https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-ios/appendix-a-dmcc-for-the-camera-reader-ios

             (function) traditional callback
    @return A promise that contains the JSON object
            {
              (string)  action  : the DMCC command that was invoked
              (bool)    status  : did it succeed or not, if an error happened it will be set to false
              (string)  err     : the error message if the action didn't complete
              (bool)  result  : the result of the taken action
            }
*/
Scanner.prototype.setLightsOn = function(on, successCallback, errorCallback){


    callback = (typeof callback === 'function') ? callback : function(result){return result;};
    on = (on) ? true : false;

    var on_off = (on)?"ON":"OFF";

    return (function(){
        return new Promise(function(resolve,reject){
                    var rr = {
                        action : "SET LIGHT.INTERNAL-ENABLE" + on_off,
                        status : false,
                        err : null
                    };


                    BarcodeScanner.CMBsetLightsOn(on, function(result){
                        rr.status = true;
                        rr.result = result;
                        resolve(rr);
                    }, function(err){
                        rr.err = err;
                        resolve(rr);
                    });

                })
        })()
        .then(callback)
        .catch(callback);



};
/**
*   @author @lazyvlad
*   @date 1/6/2018
*   @name: isLightsOn
*   @desc: Get the status of the flash unit
*   @params: (bool) on - on/off
*      URL: https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-android/appendix-a-dmcc-for-the-camera-reader
            or:
            https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-ios/appendix-a-dmcc-for-the-camera-reader-ios

             (function) traditional callback
    @return A promise that contains the JSON object
            {
    (string)    action  : the DMCC command that was invoked
         (bool) status  : did it succeed or not, if an error happened it will be set to false
                err     : the error message if the action didn't complete
                result  : the result of the taken action
            }
*/
Scanner.prototype.isLightsOn = function(callback){

    callback = (typeof callback === 'function') ? callback : function(result){return result;};

    return (function(){
        return new Promise(function(resolve,reject){
                    var rr = {
                        action : "GET LIGHT.INTERNAL-ENABLE",
                        status : false,
                        err : null
                    };


                    BarcodeScanner.CMBisLightsOn(function(result){
                        rr.status = true;
                        rr.result = result;
                        resolve(rr);
                    }, function(err){
                        rr.err = err;
                        resolve(rr);
                    });

                })
        })()
        .then(callback)
        .catch(callback);

};

/**
*   @author @lazyvlad
*   @date 1/6/2018
*   @name: resetConfig
*   @desc: Reset the config. Same as sendCommand(CONFIG.DEFAULT)
*   @params: (bool) on - on/off
*      URL: https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-android/appendix-a-dmcc-for-the-camera-reader
            or:
            https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-ios/appendix-a-dmcc-for-the-camera-reader-ios

             (function) traditional callback
    @return A promise that contains the JSON object
            {
    (string)    action  : the DMCC command that was invoked
         (bool) status  : did it succeed or not, if an error happened it will be set to false
                err     : the error message if the action didn't complete
                result  : the result of the taken action
            }
*/
Scanner.prototype.resetConfig = function(callback){

    callback = (typeof callback === 'function') ? callback : function(result){return result;};

    return (function(){
        return new Promise(function(resolve,reject){
                    var rr = {
                        action : "CONFIG.DEFAULT",
                        status : false,
                        err : null
                    };


                    BarcodeScanner.CMBresetConfig(function(result){
                        rr.status = true;
                        rr.result = result;
                        resolve(rr);
                    }, function(err){
                        rr.err = err;
                        resolve(rr);
                    });

                })
        })()
        .then(callback)
        .catch(callback);

};

Scanner.prototype.addOnResume = function(eventListener){

  eventListener = (typeof eventListener === 'function') ? eventListener : function(result){}

  document.addEventListener("resume", eventListener, false);

};

Scanner.prototype.addOnPause = function(eventListener){

  eventListener = (typeof eventListener === 'function') ? eventListener : function(result){}

  document.addEventListener("pause", eventListener, false);

};


Scanner.prototype.CONSTANTS = CONSTANTS;



module.exports = new Scanner();



});