# cmb-cordova android 7.x

> TLDR;
> If you are here just for the install commands:
>




```bash
cordova create awesome-cordova-app-with-cmbsdk
cd awesome-cordova-app-with-cmbsdk
cordova plugin add absolute_path_to_plugin_directory          //for example: /Users/superUser/cmb-cordova-master
cordova platform add android@7.0.0
//cordova platform add ios //if you want to build on ios

```



## Introduction

The purpose of this document is to provide detailed description of the API methods of the Cordova plugin that implements the cmbSDK.
The plugin on the javaScript side of things, is implemented as one *js* file that can be found in the www folder of your Cordova app.

The plugin supports two platforms Android and iOS. All the functionalities should be identical on both platforms.

In the plugin folder, we also provide a sample folder, which is basically 3 files that can be copied to your
js/index.js css/index.css and index.html of your project and a cmbconfig.js file that is copied automatically to the js folder, when the plugin is installed.


## Changelog

### version 1.2.7
  - Add function for cmbSDK license key

### version 1.2.6
  - Supportng cordova android 7.x

### version 1.2.5
  - Update to cmbSDK v. 2.0.2 for ios only

### version 1.2.4
  - Supported SAP platform. Fixed issue with icons for iOS, and camera feature for Android. We can use now the same plugin without any changes on SAP platform also.

### version 1.2.3
  - Update to cmbSDK v. 2.0.1

###  version 1.2.2
  -  Bug fixes

###   version 1.2.1
  -  iOS MX-100 improvements
  -  Android scan image result fixes

### version 1.2.0
  -  Added missing architecture libs
  -  fixed different symbology index numbers on android and ios platforms
  -  Added AAR for android support instead of JAR and SO
  -  MX - 100 support added for ios only

### version 1.1.2

  - added *setPreviewOptions()*. See CONSTANTS.PREVIEW_OPTIONS
  - added *setTriggerType()*. Sets how we handle the closing of the scanner after a result has been received. See: TRIGGER_TYPES
  - removed *setDeviceType()* Moved the device selection to *loadScanner()*
  - changed how *loadScanner()* works on native Side, it doesn't connect to the device by default,
      we now have to call *mwbScanner.connect()* after *loadScanner()* finishes loading
  - changed the callback nature of *loadScanner()*, it now returns a proper callback
  - changed the callback nature of *startScanning()* and *stopScanning()*, they now do not return a callback at all instead we need to listen
to startStop event by setting the *setActiveStartScanningCallback(callback)*
    - removed the redundant "var callback" redeclaring of the parameters

### version 1.1.1

  - Added promise support for
  *isSymbologyEnabled()*, *setSymbologyEnabled()*, *getConnectionState()*, *setCommand()*
  - *getConnectionState()* saves the callback function so next time we call getConnectionState() it reuses it
  - changed the name of the function setConnectionState to *setConnectionStateDidChangeOfReaderCallback()* to be more consistent with the native side
  - changed the CONSTANT names for SYMBOLS, from plain variables to an object for easy access
  - fixed the symbology CONSTANTS starting from index 0 for DataMatrix instead of 1

### version 1.1.0

  - Removed overhead callbacks
  - Fixed startScanning not setting the callback properly
   

## Documentation

### CONSTANTS

Let's start with the CONSTANTS that we can use for setting up numerous SCANNER features

```javascript
var CONSTANTS = {
     
/**
* @brief  DeviceType :  Device to connect to.
*/
DEVICES : ["DEVICE_TYPE_MX_1000","DEVICE_TYPE_MOBILE_DEVICE"],
DEVICES_FRIENDLY : ["MX Device","Camera"],
```

There are 2 types of devices that you can use with this Cordova plugin. An MX device which is a hardware scanner, and a smartphone Camera. 

```javascript
TRIGGER_TYPES : ["","","MANUAL_TRIGGER","","","CONTINUOUS_TRIGGER"],
```

There are 2 types of Triggers, but 6 values are reserved. 
For the MANUAL_TRIGGER setting, once a barcode is found during the scanning process, the scanner will automatically stop further scanning. 
For CONTINUOUS_TRIGGER it will keep looking for a barcode and will fire the DIDFINDBARCODE event each time it finds a barcode
```javascript
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
```

A list of available SYMBOLS to use with the our scanner. Not all are implemented on both platforms. Reffer to the wiki pages on https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-android/appendix-a-dmcc-for-the-camera-reader for more info on the SYMBOL suppport

```javascript
/**
* @brief  Symbology :  Barcode symbology to use. 
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
```

### API METHODS

#### (Promise) loadScanner(deviceType,[callback])

```javascript
/*   @return 
{
    const (string)action : the taken action (will always return LOAD READER)
    (string)  result : the message from the server
    (bool)    status : if the reader was loaded it will return true
    (string)  err    : the string error if an error was thrown
    (int)     type   : the type of the device that we connected to [0,1]
    (string)  name   : the name of the type of device DEVICES[type]
}
*/            
```

To get a scanner up and running, the first thing to do, is to call the **loadScanner()** method. It expects a device type and a callback function as a second param. The callback function is wrapped within a Promise and it is returned as one. This method does not connect to the Reader Device. We need to call **connect()** in the callback to actually connect to the Reader Device
```javascript
cmbScanner.loadScanner(deviceType,[,callback])
//example as a callback:
    cmbScanner.loadScanner("DEVICE_TYPE_MOBILE_DEVICE",function(result){
        cmbScanner.connect();
    });
//example as a Promise
    cmbScanner.loadScanner("DEVICE_TYPE_MOBILE_DEVICE").then(function(result){
        cmbScanner.connect();
    });
//example passing the device type as an integer
    cmbScanner.loadScanner(0).then(function(result){
        cmbScanner.connect();
    });
```


#### (Promise) connect([callback]) 
```javascript
/*   @return 
    (promise)  {
        status : boolean, if connection succeded true if not false
        err : string , if status false err will not be null
    }
*/ 
```

The result from the connect() method is returned as a Promise and it will return the result of the connection attempt:

```javascript
cmbScanner.connect([callback]);
cmbScanner.connect().then(function(connectionState){
    console.log(connectionState); //should tell us if the connection was done or not
  });
//as a callback function
cmbScanner.connect(function(connectionState){
  console.log(connectionState); 
});
```

Acting on the result from the connect callback is not advised because there is a listener function that can be set, that will always trigger whenever there is a change in the connection state
We will talk about this method **(setConnectionStateDidChangeOfReaderCallback)** in a moment.


#### (Promise) disconnect([callback])
```javascript
/*   @return 
    (promise)  {
        status : boolean, if connection succeded true if not false
        err : string , if status false err will not be null
    }
*/ 
```

Just as there is **connect()**, there is a **disconnect()** method that does the opossite of **connect()** : 

```javascript
cmbScanner.disconnect([callback])
```

Similarly to **connect()**, **disconnect()** too returns the connectionState in the callback function (which is wrapped into a Promise), and we could act on the connectionState, for example change the label from "connected" to "disconnected":

```javascript
cmbScanner.disconnect(function(connectionState){
  if(connectionState == cmbScanner.CONSTANTS.CONNECTION_STATE_DISCONNECTED){

    document.getElementById('some-label').innerHTML('DISCONNECTED');
  }
  else if (connectionState == cmbScanner.CONSTANTS.CONNECTION_STATE_CONNECTED){
    document.getElementById('some-label').innerHTML('DISCONNECTED');
  }
  })
```

But, just like **connect()**, we don't have to do this because of **setConnectionStateDidChangeOfReaderCallback()** that sets a listener to all connect / disconnect / connecting / disconnecting events. 

#### (void) setConnectionStateDidChangeOfReaderCallback([callback])

```javascript
cmbScanner.setConnectionStateDidChangeOfReaderCallback([callback])
```

**This method DOESN'T return a PROMISE.** It sets the callback function for all *connectionStateDidChangeOfReader* events.

The callback is optional, because we provide a default callback that handles connect / disconnect events, but the default callback is only a placeholder function and doesn't offer much functionality. 

The App developer should **always set** this method, as most of the configuration settings for the Reader will be done within this listener.
There is a full example in the [Example](#start-with-an-app) section showcasing a lot of the possible API calls.
Let's show a few here:

```javascript
cmbScanner.setConnectionStateDidChangeOfReaderCallback(function(connectionState){
//CONNECTION_STATE_DISCONNECTED :  0,
//CONNECTION_STATE_CONNECTING :  1,
//CONNECTION_STATE_CONNECTED :  2,
//CONNECTION_STATE_DISCONNECTING :  3, 
      if(connectionState == cmbScanner.CONSTANTS.CONNECTION_STATE_CONNECTED){
//do stuff while connected, like set a symbology to enabled
          return cmbScanner.setSymbologyEnabled("SYMBOL.QR",true).then(function(rr){
//see setSymbologyEnabled for more info on the rr (returned result) object

//after the symbol has been set we can send a command. Let's set the flash ON
             cmbScanner.sendCommand("SET LIGHT.INTERNAL-ENABLE ON")
              .then(function(result){
//if the command is succesful we should have the LIGHT turn ON whenever we start the scanning process
//and to check if the flash is ON we can use the isLightsOn API method
                  cmbScanner.isLightsOn().then(function(lights_on){
//light should be on
                  });
              });              
          });
      }   
  });
```


#### (void) setResultCallback([callback])


To handle succesful scan results, we need to setup the ResultCallback function. This is done via the
setResultCallback.

**This method DOESN'T return a PROMISE.** It sets the callback function for all *didReceiveReadResultFromReader* events.

```javascript
cmbScanner.setResultCallback(callback) 

cmbScanner.setResultCallback(function(result){
/**
*   Structure of the result object:
*   result.symbology - string representation of the barcode symbology detected
*   result.readString - string representation of the read
*/
     if (result.symbology == 'NO READ') {
//Perform some action when no barcode is read or just leave it empty
       // navigator.notification.alert("Stopped");
     }
     else if (result && result.readString) {
//Perform some action on barcode read              
     }
});
```

ResultCallback will fire every time there is a barcode scan (or the scanner was stopped either manually or it timedout with No Result).


#### (void) startScanning([callback]); (void) stopScanning([callback])
```javascript
/*   @return Promise
      (bool) value of the Scanner Activity (true if active, false if off)
*/ 
```

To start / stop the scanning process, we use these methods. 
They take a callback as a parameter, but it will overwrite the "main" callback function only if it's not set by **setActiveStartScanningCallback()** already. 

Becuse of the nature of the READERS we should always set the **[setActiveStartScanningCallback()](#void-setactivestartscanningcallbackcallback)** function, if we want to control certain DOM elements based on the status of the scanner (Reader)

```javascript
cmbScanner.startScanning(callback)
cmbScanner.stopScanning(callback)

cmbScanner.startScanning(function(scannerState){
      if(scannerState){
        document.getElementById('scanner-active-label').innerHTML('RUNNING');      
      else
        document.getElementById('scanner-active-label').innerHTML('STOPPED');      
    }

  });


cmbScanner.stopScanning(); 
```

```html
<a href="javascript:;" onClick="cmbScanner.startScanning()">Start Scanner</a>
<a href="javascript:;" onClick="cmbScanner.stopScanning()">Stop Scanner</a>
```

#### (void) setActiveStartScanningCallback(callback)
```javascript
cmbScanner.setActiveStartScanningCallback(function(scannerState){
  if(scannerState){
    console.log('scanner is working');

  }
  else{
    console.log('scanner is not working');
  }
  })
```

Listen on events when startting/ stopping the scanner. If callback set, whenever startScanning() / stopScanning() is called, or the scanner stops scanning because a READ was found, the callback function will be invoked.


#### (Promise) setSymbologyEnabled(symbol,on_off,[callback])

```javascript
/* @return A promise that contains the JSON object
        {
            action  : the DMCC command that was invoked
            status  : did it succeed or not, if an error happened it will be set to false
            err     : the error message if the action didn't complete
        }
*/        
```

Once there is a connection to the Reader, we can enable symbologies by calling **setSymbologyEnabled()**. 
It expects a string value of the symbol to be enabled [see constants for more](#constants).
Returns a Promise.


```javascript
cmbScanner.setSymbologyEnabled("SYMBOL.C93",true,function(result){
  console.log(JSON.stringify(result));
//will print {"action" : "SET SYMBOL.C93 ON","status" : true, "err" : null} 
});
```


#### (Promise) isSymbologyEnabled(symbol,[callback])

```javascript
/**
@return A promise that contains the object
{
    action  : the DMCC command that was invoked
    status  : did it succeed or not, if an error happened it will be set to false
    result  : if the symbol is enabled then true, if not then false
    err     : the error message if the action didn't complete
}
*/
```

To check if we have a symbol enabled, we use **isSymbologyEnabled()**. The result is returned in the callback which is then wrapped into a Promise.


```javascript
cmbScanner.isSymbologyEnabled("SYMBOL.C93",function(rr){
  console.log(JSON.stringify(rr));
//will print {"action" : "GET SYMBOL.C93","status" : true, "err" : null,"result" : true} 
});
```


#### (Promise) setLightsOn(lights_on, callback) ; (Promise) isLightsOn(callback)
```javascript
/**
@return A promise that contains the JSON object
{
  (string)  action  : the DMCC command that was invoked
  (bool)    status  : did it succeed or not, if an error happened it will be set to false
  (string)  err     : the error message if the action didn't complete
  (bool)  result    : the result of the taken action, in this case TRUE if the light was enabled, false if not
}
*/
```

If we want to enable the flash by default we can use **setLightsOn()** and to check if it is enabled with **isLightsOn()**
**setLightsOn()** and **isLightsOn()** both return a Promise.



#### (Promise) getConnectionState([callback])
```javascript
@return A promise that resolves with an int value connectionState
//CONNECTION_STATE_DISCONNECTED :  0,
//CONNECTION_STATE_CONNECTING :  1,
//CONNECTION_STATE_CONNECTED :  2,
//CONNECTION_STATE_DISCONNECTING :  3

```

If you need to get the current connection state, **getConnectionState()** can be used

```javascript
cmbScanner.getConnectionState(function(connectionState){
//will return the current connection state
    console.log(connectionState)
  });
//or with a promise
cmbScanner.getConnectionState().then(function(connectionState){
  console.log(connectionState);
  });
```


#### (void) setCameraMode(cameraMode)

To set how the camera will behave when we use CAMERA device as a barcode Reader we use:

```javascript
cmbScanner.setCameraMode(cameraMode)
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
```

*Note:  It should be called before we call **loadScanner()** for it to take effect. Calling it after the scanner was loaded won't do anything if the scanner is loaded.*

#### (void) setPreviewContainerPositionAndSize(x,y,w,h)
```javascript
/*
  @params x,y,w,h
        x,y  : top left position
        w,h  : width and height of the rectangular in precentages of the full container
*/
```

Set the size and position of the preview screen.


Example:
```javascript
cmbScanner.setPreviewContainerPositionAndSize(0,0,100,50);
//will set the preview to 0,0 and 100% width 50% height
```



#### (void) cmbScanner.enableImage(enable_disable) ; (void) cmbScanner.enableImageGraphics(enable_disable)

To enable / disable result type returned as image use
```javascript
  cmbScanner.enableImage(true);
```
It adds to the DATA.RESULT_TYPE an 8. Doesn't return a value. Default DATA.RESULT_TYPE is 10.

Same for **enableImageGrapics()**. This one adds to the DATA.RESULT_TYPE a 16
```javascript
  cmbScanner.enableImageGraphics(false);
```

#### (void) cmbScanner.setPreviewOptions(ORED_VALUES_OF_PREVIEW_OPTIONS)

Set the overrided preview options. 
This function expects an integer that is a result of the ORed result of all the preview options that we want enabled. 
Doesn't return a value.
Should be called before **loadScanner()** (same as cameraMode())
Example:
```javascript
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
}

cmbScanner.setPreviewOptions(PREVIEW_OPTIONS.NO_ZOOM_BTN | PREVIEW_OPTIONS.NO_ILLUM_BTN);
```


#### (Promise) getDeviceBatteryLevel([callback])
```javascript
/*
@return A promise that contains the JSON object
{
    action  : the DMCC command that was invoked
    status  : did it succeed or not, if an error happened it will be set to false
    charge  : (int) the charge in percentage
    err     : the error message if the action didn't complete
}
*/
```

Helper method to show the battery levels of the connected device. Use it like this:


```javascript
cmbScanner.getDeviceBatteryLevel(function(result){
  console.log(JSON.stringify(result));
  });
```

#### (void) setAvailabilityCallback([callback])

Set a listener on availability changes. Will fire when the device becomes available. 
Does not return a Promise.

Use it as:
```javascript
cmbScanner.setAvialabilityCallback(funciton(availability){
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
});

```

#### (Promise) resetConfig([callback])
```javascript
/*
@return A promise that contains the JSON object
{
  (string) action  : the DMCC command that was invoked
  (bool)   status  : did it succeed or not, if an error happened it will be set to false
  (string) err     : the error message if the action didn't complete and there is an error. default is null
  (bool)  result   : the result of the resetConfig action 
}
*/
```

To reset the configuration options we can use **resetConfig**


```javascript
cmbScanner.resetConfig(function(result){
  console.log(result);
  })

```

#### (Promise) sendCommand([callback])

```javascript
/*
@return A promise that contains the JSON object
{
  (string) action  : the DMCC command that was invoked
  (bool)   status  : did it succeed or not, if an error happened it will be set to false
  (string) err     : the error message if the action didn't complete and there is an error. default is null
  (bool)  result   : the result of the sendCommand action 
}
*/
```


Finally, all the methods can be replaced with sending DMCC strings to the READER device. For that we can use our API method **sendCommand**. It can be used to control the Reader completely with command strings.
More on the command strings can be found [here](https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-android/appendix-a-dmcc-for-the-camera-reader) or [here](https://cmbdn.cognex.com/wiki/-cognex-mobile-barcode-sdk-for-ios/appendix-a-dmcc-for-the-camera-reader-ios)

Use it like this:
```javascript
cmbScanner.sendCommand("SET SYMBOL.POSTNET OFF") 
          .then(function(result){
//and in the promise let's see what our command did
              console.log(JSON.stringify(result));
          });
//or like this                                  
cmbScanner.sendCommand("SET LIGHT.INTERNAL-ENABLE ON")
          .then(function(result){
//if the command is succesful we should have the LIGHT turn ON whenever we start the scanning process
              console.log(JSON.stringify(result));
          });
```



## Start with an App

To build an awesome app with cordova, we first need to create one with the cordova starter:

```bash
cordova create awesome-cordova-app-with-cmbsdk
cd awesome-cordova-app-with-cmbsdk
cordova plugin add absolute_path_to_plugin_directory          //for example: /Users/superUser/cmb-cordova-master
cordova platform add android
//cordova platform add ios //if you want to build on ios

```


For an Ionic solution

```bash
#install ionic
sudo npm install -g cordova ionic
#start an ionic app with tabs layout
ionic start awesome-ionic-app tabs
cd awesome-ionic-app
#add our plugin
ionic cordova plugin add /WORKPLACE/PLUGINS/cmb-cordova //path to where you unzipped our plugin
#add the platform
ionic cordova platform add android@6.4.0 //7.0.0 currently throws an error

```

```bash
brew update && brew install gradle
# see https://gradle.org/install/
//to build directly from the console need to change the permissions of the gradlew file
sudo chmod 755 /Users/*<your ionic project path>*/platforms/android/gradlew 
//going to need ionic-native too
npm install ionic-native --save

//will run on android with live refresh and console logs
ionic cordova run android -l -c
```


This will create an app. The developer needs to be familiar with the process of developing on Cordova. There are quirks, like iOS will want a signing profile, or android will complain about the manifest file. 
*note* At the time when this document was written, the android platform was broken, the correct way to add the android platform was
```bash
cordova platform add android@6.4.0
```
We won't discuss these cases in this document, and we leave its handling to the developer's capable hands.

Once there is a cordova app that builds on the desired platform, we can add our Cognex solution.

In the cordova plugin folder from the sample folder we need to copy the index.html into the platform www folder. The index.js into www/js/index.js and the index.css into www/css/index.css. cmbconfig.js is copied automatically to the www/js folder.

Cordova Plugin Folder
![image](https://user-images.githubusercontent.com/226620/34641508-dc77a114-f305-11e7-86cc-40f45228ef5c.png)

Index.html on iOS platform
![image2](https://user-images.githubusercontent.com/226620/34641544-2c1636cc-f306-11e7-8a43-ee2d624a27fc.png)

index.js on iOS platform
![image3](https://user-images.githubusercontent.com/226620/34641550-41abc060-f306-11e7-9f5b-3f86d7970641.png)

index.css on iOS platform
![image4](https://user-images.githubusercontent.com/226620/34641559-57b69416-f306-11e7-83e5-888ff6b21dbb.png)


### License Key(s)


**IMPORTANT**

Usage of the Cordova plugin with an MX device is free, but if you want to utilize the CAMERA DEVICE (scan with the smartphone camera), you need to obtain a license from [CMBDN](https://cmbdn.cognex.com). 

The Reader still works without a license, but results are randomly masked with * chars.

It's free to register and you can obtain a 30 day trial license key. Once the key is obtained, depending on the platform we either set it inside the android manifest file:

![AndroidManifest.xml](https://user-images.githubusercontent.com/226620/34641591-ba201cda-f306-11e7-9a08-28b42ed5d1ee.png)

or inside the iOS plist file for iOS

![iOS Plist](https://user-images.githubusercontent.com/226620/34641700-6616afd0-f308-11e7-8555-11411ed88b74.png)

Trial keys are not bound to the app bundle name / package name, but they only last for 30 days. 
Production keys are bound to the bundle name of the app, and this needs to be taken into account when you setup the license key.

On the image, we show the bundle Identifier on the iOS platform
![bundle name](https://user-images.githubusercontent.com/226620/34641799-cecb5b7e-f309-11e7-906c-7b2f3310915d.png)

> Android minSDK version needs to be bumped to 19

```html

    <uses-sdk android:minSdkVersion="19" android:targetSdkVersion="26" />
    
```

### Explanation of the solution

The *cmbconfig.js* file contains most of the fun code, it's heavily commented and shows most of the scenarios that we can encounter.

For the purpose of the demo app, we wanted to show how one would go about choosing a device type, connecting to it, listening on connection events, setting symbologies, testing symbologies, showing results, DOM manipulation of buttons and labels. 
A lot of the code would be an overhead in a real life APP (for example you wouldn't want to enable all the symbologies like in the example), but it's a DEMO app after all. 

```javascript
/**
* @name : Cmbconfig
* @desc : A class for setting different configuration collections. Start different configuration instances of the scanner
* NOTE:
* Config doesn't need to be implemented in this way. 
* This is just one of the possible ways to implement the configuration
* This config is an APP solution and not a feature of the cmbSDK
*/
var Cmbconfig = (typeof Cmbconfig === 'function') ? Cmbconfig : function(scanner){
    if (typeof scanner === 'undefined'){
        console.log('No Scanner object');
        return false;
    }
//keep a reference to the scanner
    this.scanner = scanner;
//we start the app not connected to a READER
    this.connectionState = false;

//Adding all the symbols that are available to the MX scanner (some of these can not be enabled for the CAMERA scanner)
    this.Symbols = [
          "SYMBOL.DATAMATRIX"
          ,"SYMBOL.QR"
          ,"SYMBOL.C128"
          ,"SYMBOL.UPC-EAN"
          ,"SYMBOL.C11"
          ,"SYMBOL.C39"
          ,"SYMBOL.C93"
          ,"SYMBOL.I2O5"
          ,"SYMBOL.CODABAR"
          ,"SYMBOL.EAN-UCC"
          ,"SYMBOL.PHARMACODE"
          ,"SYMBOL.MAXICODE"
          ,"SYMBOL.PDF417"
          ,"SYMBOL.MICROPDF417"
          ,"SYMBOL.DATABAR"
          ,"SYMBOL.POSTNET"
          ,"SYMBOL.PLANET"
          ,"SYMBOL.4STATE-JAP"
          ,"SYMBOL.4STATE-AUS"
          ,"SYMBOL.4STATE-UPU"
          ,"SYMBOL.4STATE-IMB"
          ,"SYMBOL.VERICODE"
          ,"SYMBOL.RPC"
          ,"SYMBOL.MSI"
          ,"SYMBOL.AZTECCODE"
          ,"SYMBOL.DOTCODE"
          ,"SYMBOL.C25"
          ,"SYMBOL.C39-CONVERT-TO-C32"
          ,"SYMBOL.OCR"
          ,"SYMBOL.4STATE-RMC"
          ,"SYMBOL.IT-DOES-NOT-EXIST-IN-THE-SYMBOL-LIST" //doesn't exist on purpose
    ];




};


Cmbconfig.prototype.defaultSettings = function(){

//get a refference to this object
  var me = this;
    
//For our example let's have a Preview Container positioned on 0,0 (left,top) 100% right and 50% bottom. This only works for the CAMERA Scanner mode    
    this.scanner.setPreviewContainerPositionAndSize(0,0,100,50);
    
//We can send commands to our READER (MX DEVICE or CAMERA) only after we have a valid connection. 
//This is the place to handle connect/disconnect code
    this.scanner.setConnectionStateDidChangeOfReaderCallback((connectionState) => {
//If the Reader connects we can start adding some configuration options to it
        if ((connectionState == this.scanner.CONSTANTS.CONNECTION_STATE_CONNECTED)){
//But only if there was a change in the connection sate (we don't want two connect events to fire the same code twice)
          if(this.connectionState != connectionState){
//Let's save the connectionState
            this.connectionState = connectionState;
//Change the example label that we have in index.html            
              document.getElementById("lblConnectionState").innerHTML = "Connected";
//Setup an array to hold promises. The callback functions from setSymbologyEnabled, isSymbologyEnabled, sendCommand,
// all return promises
              let promises = []; 
//just an object to hold the results from all the logs that we will have after each method finishes 
              let return_object = {};         
//let's go through all the symbols in our Symbols array and activate them one by one
              this.Symbols.forEach((symbol) => {
//keep all promises in an array so we can do things to our Reader Device after all the stuff we setup is finished                
                 promises.push(
//first check if symbologies are enabled.             
                    me.scanner.isSymbologyEnabled(symbol).then(function(result){
//we will have a result.status true if the action went through, and false for an error, if there is an error there will be a result.err property 
//to read the error from
                        if(result.status){
//those symbols that are enabled would return result.result true
                            var answer = (result.result) ? " : YES" : " : NO";
//log the result                            
                              console.log(result.action + answer);
//add it to the results object which can be printed in the Promise.all later on                              
                              return_object.first_isSymbologyEnabled = result;
//if the symbol isn't enabled, let's enabled it                              
                              if(!result.result){
//notice the return in front of me.scanner.setSymbologyEnabled, we don't have to return it, but then Promise.all 
//won't wait for all the actions to finish before resolving to true, so if we care about racing conditions, we should always return the promise
                                return me.scanner.setSymbologyEnabled(symbol,true).then(function(rr){
                                //log the status of the action
                                    if(rr.status)
                                        console.log(rr.action + " : SUCCESS");
                                    else
                                        console.log(rr.action + " : FAILED! " + rr.err);
//add it to the results object                                      
                                      return_object.setSymbologyEnabled = rr;
//after we've enabled the symbologies let's see if they are enabled, just for the fun of it. In a real world app we won't be doing this                              
                                    return me.scanner.isSymbologyEnabled(symbol).then(function(result){
                                      if(result.status){
                                          var answer = (result.result) ? " : YES" : " : NO";
                                          console.log(result.action + answer);
                                      }
                                      else{

                                          console.log(result.action + " : NO! " + result.err);
                                      }
//and add it to the return_object                                        
                                        return_object.second_isSymbologyEnabled = result;
//finally return the return_object that we have been building through all the promise methods.                                        
                                        return return_object;
                                    });
                                });
                              }
                        } //end if result.status from isSymbologyEnabled
//the symbologies that are not supported by our Reader Device will return an error that will be logged here                    
                        else
                          console.log(result.action + " : NO! " + result.err);
                      })
                  );
              }); //end forEach

//This will make the app wait untill all the stuff we told the Reader Device to do is finished, so then we can be sure to continue with our configuration
              Promise.all(promises).then(function(results){
//we can check the results from all the actions here (if we care to), results is an array of all the return_object(s)
                  console.log(JSON.stringify(results));

//after all said and done let's see how we can disable a symbol with a DMCC command
//DMCC commands should be used for controlling the DEVICES, helper methods like setSymbologyEnabled are just wrapper methods that
//use the DMCC commands
//we are going to disable a symbol that we previously set
                    me.scanner.sendCommand("SET SYMBOL.QR OFF")
                            .then(function(result){
//and in the promise let's see what our command did
                              console.log(JSON.stringify(result));
                            });
//let's not wait for the command to finish before we send a new one                                    
                   me.scanner.sendCommand("SET LIGHT.INTERNAL-ENABLE ON")
                            .then(function(result){
//if the command is succesful we should have the LIGHT turn ON whenever we start the scanning process
                              console.log(JSON.stringify(result));
                            });
//let's call the getConnectionState method again, even though we are connected, this time without setting a callback, we do call it way down again, which in the runtime of the app will come before
//this call and there we set a callback. The callback will be saved so now we don't have to use it again                          
                    me.scanner.getConnectionState().then(function(connectionState){
//so the callback that we set further down will be called, and the cool thing is it actually returns a promise so we can chain
//it and do additional things with our result 
                        if (connectionState == me.scanner.CONSTANTS.CONNECTION_STATE_CONNECTED) {
                          console.log('Hey, we are still connected, let\'s do more stuff');
                          me.scanner.sendCommand("GET DEVICE.TYPE").then(function(result){
                              console.log(JSON.stringify(result));
                          });
//sendCommand will accept a traditional callback too, so whichever form suits you will work                                  
                          me.scanner.sendCommand("GET DATA.RESULT-TYPE",function(result){
                              console.log(JSON.stringify(result));
                          });
                          
                        }
                    });                                 
              });
          } else {
            console.log('connectionState did not change even though the event was fired');
          }

        } else {
//if the Reader device isn't connected we will update the label to "Disconnected"          
           document.getElementById("lblConnectionState").innerHTML = "Disconnected";
        }
    });
//Quick get the connection state of the scanner.
//because the scanner is not connected yet, we should see a message in the debug window telling us the READER isn't available
//but since we "save" our callbacks, the next time we call getConnectionState() without setting a callback this will be reused
    this.scanner.getConnectionState((connectionState)=>{
        /**
        * connectionState - int representation of the DataManSystem object connection state
        */

        if(!Number.isInteger(connectionState)){
//if connectionState is not a number value, then we have an error, let's show it
            console.log(connectionState);
        }


        if (connectionState == this.scanner.CONSTANTS.CONNECTION_STATE_DISCONNECTED) {
//Perform some action when the DataManSystem object is not connected to any remote system.
          console.log('The Reader Device is Disconnected');
        }
        else if (connectionState == this.scanner.CONSTANTS.CONNECTION_STATE_CONNECTING) {
//Perform some action when the DataManSystem object is
//in the process of establishing a connection to a remote system.
          console.log('The Reader Device is Connecting');
        }
        else if (connectionState == this.scanner.CONSTANTS.CONNECTION_STATE_CONNECTED) {
//Perform some action when the DataManSystem object is connected to a remote system.
          console.log('The Reader Device is Connected');
        }
        else if (connectionState == this.scanner.CONSTANTS.CONNECTION_STATE_DISCONNECTING) {
//Perform some action when the DataManSystem object is
//in the process of disconnecting from a remote system.
          console.log('The Reader Device is Disconnecting');
        }
        return connectionState;
    });


//One of the ways to set a resultCallback. Once a barcode is found we need to return its value. This callback handles that.
//note that the same callback can be set via loadScanner function, and if the callback doesn't change during the runtime
//of the app this shouldn't be called at all
        me.scanner.setResultCallback(function(result){
/**
*   Structure of the result object:
*   result.symbology - string representation of the barcode symbology detected
*   result.readString - string representation of the read
*/
             if (result.symbology == 'NO READ') {
//Perform some action when no barcode is read
               document.getElementById("show-result").innerHTML = "There was no result";
             }
             else if (result && result.readString) {
             //Perform some action on barcode read
             //example:
                //alert(result.readString, function(){}, result.symbology, ''); //this can be used if we only want to show an alert
               document.getElementById("show-result").innerHTML = result.readString; //update the DOM element with id #show-result with the value of the barcode
             }
        });

//After these simple callbacks let's try to connect to our CAMERA connector and load the scanner
      this.scanner.setDeviceType(1);

//if you are going to change the cameraMode, you need to do it before loadScanner is called, otherwise there will be no effect
      this.scanner.setCameraMode(3);   //this will use front facing camera on the Camera Device    

//load the scanner and set the callback function for readResults, this will overwrite the one that we
//set in the setResultCallback, so in a real app scenario where the callback doesn't change we can go with only this one
      this.scanner.loadScanner(function(result){
/**
*   Structure of the result object:
*   result.symbology - string representation of the barcode symbology detected
*   result.readString - string representation of the read
*/
         if (result.symbology == 'NO READ') {
//Perform some action when no barcode is read
            document.getElementById("show-result").innerHTML = "loadScanner callback - NO READ";
         }
         else if (result && result.readString) {
           document.getElementById("show-result").innerHTML = "loadScanner callback: " + result.readString; //update the DOM element with id #show-result with the value of the barcode
         }
      });

}

Cmbconfig.prototype.alternativeSettings = function(){
  //if we want to use another set of settings we can put them here...

}

```

*index.html* contains the inclusions of the necessary js files and a general setup of the app.

```html
<!DOCTYPE html>
<!--
 Copyright (c) 2012-2016 Adobe Systems Incorporated. All rights reserved.

 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 -->
<html>

<head>
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
    <meta name="viewport" content="initial-scale=1, width=device-width, height=device-height, viewport-fit=cover">  

    <!-- This is a wide open CSP declaration. To lock this down for production, see below. -->
    <meta http-equiv="Content-Security-Policy" content="default-src ‘self’ gap://ready file://* *; style-src ‘self’ ‘unsafe-inline’; script-src ‘self’ ‘unsafe-inline’ ‘unsafe-eval’">
    <!-- Good default declaration:
     * gap: is required only on iOS (when using UIWebView) and is needed for JS->native communication
     * https://ssl.gstatic.com is required only on Android and is needed for TalkBack to function properly
     * Disables use of eval() and inline scripts in order to mitigate risk of XSS vulnerabilities. To change this:
     * Enable inline JS: add 'unsafe-inline' to default-src
     * Enable eval(): add 'unsafe-eval' to default-src
     * Create your own at http://cspisawesome.com
     -->
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: 'unsafe-inline' https://ssl.gstatic.com; style-src 'self' 'unsafe-inline'; media-src *" /> -->

    <link rel="stylesheet" type="text/css" href="css/index.css" />
    <title>Cognex Demo Grounds</title>
</head>

<body>
<div class="app">
    <div id="title-bar">
        <img id="logo-img" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='192' height='192' viewBox='0 0 192 192'><defs><style>.cls-1{fill:#fff200;}.cls-2{clip-path:url(#clip-path);}.cls-3{fill:#231f20;}</style><clipPath id='clip-path' transform='translate(0 0)'><rect class='cls-1' width='192' height='192' rx='10' ry='10'/></clipPath></defs><title>lazy-cognexflat</title><g id='Layer_2' data-name='Layer 2'><g id='Layer_1-2' data-name='Layer 1'><rect class='cls-1' width='192' height='192' rx='10' ry='10'/><g class='cls-2'><image width='192' height='192' xlink:href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsSAAALEgHS3X78AAACFklEQVR4Xu3ToQEAIAzAsP1/Lg+ME/A0Iq62s2cWquYVwM8MQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYA0A5BmANIMQJoBSDMAaQYgzQCkGYC0C2MdGMpeSjFDAAAAAElFTkSuQmCC'/></g><path class='cls-3' d='M32.216,110.594C32.216,139.243,48.3,146,75.324,146H123.7c30.134,0,36.081-12.973,36.081-29.461V107.35h-30c0,12.162-4.054,13.514-17.567,13.514H80.19c-14.19,0-17.162-5.407-17.162-19.595V90.73c0-12.162,2.973-19.595,18.783-19.595h32.7c8.918,0,14.054,2.027,14.054,9.054v2.7h30C158.838,55.189,153.3,46,110.595,46H75.324C48.3,46,32.216,52.756,32.216,81.4v29.189Z' transform='translate(0 0)'/></g></g></svg>" />
        <h1 id="title">cmbSDK Cordova Demo</h1>
    </div>
 
    <div id="content">
        <div class="results-header">Results</div>
        <!--  Results will show up here              -->
    </div>
    <div id="footer">
        <div id="deviceready" class="blink">
            <p class="event listening">Booting Cordova</p>
            <p id="device-connection" class="event received">Ready for Connections</p>
        </div>
        <a id="connect-btn" class="btn connect" href="javascript:;"></a>
        <a id="pick-device" class="btn device" href="javascript:;">Pick Device [Camera]</a>
        <a id="scanner-btn" class="btn start" href="javascript:;"></a>
        <a id="continious-btn" class="btn picker" href="javascript:;"></a>

    </div>

</div>
<script type="text/javascript" src="cordova.js"></script>
<script type="text/javascript" src="js/index.js"></script>
<script type="text/javascript" src="js/cmbconfig.js"></script>
<script type="text/javascript">
    app.initialize();
</script>
</body>

</html>
```

index.js contains most of the same code as the one that comes default with cordova.
The change we did is to create our cmbConfig object and call the **defaultSettings()** method

```javascript
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
initialize: function() {
    this.bindEvents();
},
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
},
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
onDeviceReady: function() {
    app.receivedEvent('deviceready');
    var cmbConfig = new Cmbconfig(cmbScanner);

    cmbConfig.defaultSettings();

    
},
    // Update DOM on a Received Event
receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
}
};
```
