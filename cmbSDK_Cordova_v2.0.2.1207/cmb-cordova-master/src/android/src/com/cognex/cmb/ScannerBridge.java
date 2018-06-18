package com.cognex.cmb;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Point;
import android.support.v4.app.ActivityCompat;
import android.util.Base64;
import android.util.Log;
import android.view.Display;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.WebView;
import android.widget.RelativeLayout;

import com.cognex.dataman.sdk.ConnectionState;
import com.cognex.dataman.sdk.DataManSystem;
import com.cognex.dataman.sdk.DmccResponse;
import com.cognex.dataman.sdk.MXHelper;
import com.cognex.mobile.barcode.sdk.ReadResult;
import com.cognex.mobile.barcode.sdk.ReadResults;
import com.cognex.mobile.barcode.sdk.ReaderDevice;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.lang.reflect.Field;

/**
 * This class executes native code when called from JavaScript.
 */
public class ScannerBridge extends CordovaPlugin implements
        ReaderDevice.ReaderDeviceListener {

    int param_cameraMode = 0;
    int param_previewOptions = 0;
    float param_positionX = 0;
    float param_positionY = 0;
    float param_sizeWidth = 100;
    float param_sizeHeight = 50;
    int param_triggerType = 2;
    int param_deviceType = 0;

    ReaderDevice readerDevice;

    private boolean isScanning = false;

    // CMB Listener callbacks
    CallbackContext didReceiveReadResultFromReaderCallbackID;
    CallbackContext availabilityDidChangeOfReaderCallbackID;
    CallbackContext connectionStateDidChangeOfReaderCallbackID;
    CallbackContext scanningStateChangedCallbackId;

    // USB Listener, no need for conditional code
    boolean listeningForUSB = false;

    public enum DeviceType {MX_1000, MOBILE_DEVICE}

    private static final DeviceType[] deviceTypeValues = DeviceType.values();

    private static final ReaderDevice.Symbology[] symbologyValues = ReaderDevice.Symbology.values();

    public static ReaderDevice.Symbology symbologyFromInt(int i) {
        return symbologyValues[i];
    }

    public static DeviceType deviceTypeFromInt(int i) {
        return deviceTypeValues[i];
    }

    // initial scanner view position in %
    float position_xp = 0;
    float position_yp = 0;
    float position_wp = 100;
    float position_hp = 50;

    @Override
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
        //Custom API
        // to reorder
        if (action.equals("didReceiveReadResultFromReaderCallback")) {
            didReceiveReadResultFromReaderCallbackID = callbackContext;
            return true;
        } else if (action.equals("availabilityDidChangeOfReaderCallback")) {
            availabilityDidChangeOfReaderCallbackID = callbackContext;
            return true;
        } else if (action.equals("connectionStateDidChangeOfReaderCallback")) {
            connectionStateDidChangeOfReaderCallbackID = callbackContext;
            return true;
        } else if (action.equals("loadScanner")) {
            //added by lazyvlad on 1/2/2018
            param_deviceType = args.getInt(0);
            if (param_deviceType == DeviceType.MOBILE_DEVICE.ordinal()) {
                if (!cordova.hasPermission(Manifest.permission.CAMERA)) {
                    cordova.requestPermission(this, 234, Manifest.permission.CAMERA);
                }
            }
            loadScanner(callbackContext);
            return true;
        } else if (action.equals("setActiveStartScanningCallback")) {

            scanningStateChangedCallbackId = callbackContext;
            return true;
        } else if (action.equals("getAvailability")) {
            if (isReaderInit(callbackContext)) {
                getAvailability(callbackContext);
            }
            return true;
        } else if (action.equals("enableImage")) {
            if (isReaderInit(callbackContext))
                readerDevice.enableImage(args.getBoolean(0));
            return true;
        } else if (action.equals("enableImageGraphics")) {
            if (isReaderInit(callbackContext))
                readerDevice.enableImageGraphics(args.getBoolean(0));
            return true;
        } else if (action.equals("getConnectionState")) {
            if (isReaderInit(callbackContext))
                getConnectionState(callbackContext);
            return true;
        } else if (action.equals("connect")) {
            //added by lazyvlad on 1/2/2018
            connect(callbackContext);
            //return a proper callback to the cordova plugin
            return true;
        } else if (action.equals("startScanning")) {
            startScanning(callbackContext);
            return true;
        } else if (action.equals("stopScanning")) {
            stopScanning(callbackContext);
            return true;
        } else if (action.equals("getDeviceBatteryLevel")) {
            getDeviceBatteryLevel(callbackContext);
            return true;
        } else if (action.equals("setSymbologyEnabled")) {
            int symbology = 0;
            boolean enable = false;
            try {
                symbology = args.getInt(0);
                enable = args.getBoolean(1);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            setSymbologyEnabled(callbackContext, symbologyFromInt(symbology), enable);
            return true;
        } else if (action.equals("isSymbologyEnabled")) {
            int symbology = 0;
            try {
                symbology = args.getInt(0);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            isSymbologyEnabled(callbackContext, ScannerBridge.symbologyFromInt(symbology));
            return true;
        } else if (action.equals("setLightsOn")) {
            boolean on = false;
            try {
                on = args.getBoolean(0);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            this.setLightsOn(callbackContext, on);
            return true;
        } else if (action.equals("isLightsOn")) {
            isLightsOn(callbackContext);
            return true;
        } else if (action.equals("resetConfig")) {
            resetConfig(callbackContext);
            return true;
        } else if (action.equals("sendCommand")) {
            String commandString = "";
            try {
                commandString = args.getString(0);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            sendCommand(callbackContext, commandString);
            return true;
        } else if (action.equals("setPreviewContainerPositionAndSize")) {
            try {
                position_xp = (float) args.getDouble(0);
                position_yp = (float) args.getDouble(1);
                position_wp = (float) args.getDouble(2);
                position_hp = (float) args.getDouble(3);
            } catch (JSONException e) {
                e.printStackTrace();
            }
//            setPreviewContainerPositionAndSize(x, y, w, h);
            cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    stopScanning(scanningStateChangedCallbackId);
                    updatePreviewContainerValues();
                    updateScannerViewPosition();
                }
            });

            return true;
        } else if (action.equals("setCameraMode")) {
            int cameraMode = 0;
            try {
                cameraMode = args.getInt(0);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            setCameraMode(cameraMode);
            return true;
        } else if (action.equals("setPreviewOptions")) {
            int previewOptions = 0;
            try {
                previewOptions = args.getInt(0);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            setPreviewOptions(previewOptions);
            return true;
        } else if (action.equals("disconnect")) {
            disconnect(callbackContext);
            return true;
        } else if (action.equals("beep")) {
            beep(callbackContext);
            return true;
        } else if (action.equals("registerSDK")) {
            String key = "";
            try {
                key = args.getString(0);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            registerSDK(key);
            return true;
        }
        ;

        return false;
    }

    //Custom API methods
    private void loadScanner(final CallbackContext callbackContext) {

        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {

                if (listeningForUSB) {
                    readerDevice.stopAvailabilityListening();
                    listeningForUSB = false;
                }

                if (isReaderInit(null)) {
                    readerDevice.disconnect();
                    readerDevice = null;
                }
                removeScannerView();

                if (deviceTypeFromInt(param_deviceType) == DeviceType.MOBILE_DEVICE) {
                    updatePreviewContainerValues();
                    addScannerView();
                    readerDevice = ReaderDevice.getPhoneCameraDevice(cordova.getActivity(), param_cameraMode, param_previewOptions, scannerView);
                } else {
                    readerDevice = ReaderDevice.getMXDevice(cordova.getActivity());
                    if (!listeningForUSB) {
                        readerDevice.startAvailabilityListening();
                        listeningForUSB = true;
                    }
                }
                readerDevice.setReaderDeviceListener(ScannerBridge.this);
                readerDevice.enableImage(true);

                PluginResult pr = new PluginResult(PluginResult.Status.OK, true);
                callbackContext.sendPluginResult(pr);

                //@lazyvlad let's remove this
//                readerDevice.connect(new ReaderDevice.OnConnectionCompletedListener() {
//                    @Override
//                    public void onConnectionCompleted(ReaderDevice readerDevice, Throwable throwable) {
//                        if (throwable != null)
//                            Log.e("ScannerBridge", "ReaderDevice connection error: " + throwable.getMessage());
//                    }
//                });
            }
        });

        //custom calls:
        //ScannerActivity.readerDevice.getDataManSystem().sendCommand("SET TRIGGER.TYPE 5");
        //ScannerActivity.setTriggerType(5);
    }

    RelativeLayout scannerView;

    private void removeScannerView() {
        if (scannerView == null) {
            return;
        }

        if (scannerView.getParent() != null) {
            ((ViewGroup) scannerView.getParent()).removeView(scannerView);
        }

        scannerView = null;
    }

    private void updateScannerViewPosition() {
        try {
            if (scannerView != null && scannerView.getLayoutParams() != null) {

                scannerView.getLayoutParams().width = Math.round(param_sizeWidth);
                scannerView.getLayoutParams().height = Math.round(param_sizeHeight);

                Class c = scannerView.getLayoutParams().getClass();
                Field field = null;

                try {
                    field = c.getDeclaredField("x");
                } catch (NoSuchFieldException ex) {
                    ex.printStackTrace();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
                try {
                    field = c.getDeclaredField("leftMargin");
                } catch (NoSuchFieldException ex) {
                    ex.printStackTrace();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }

                try {
                    field.setAccessible(true);
                    field.set(scannerView.getLayoutParams(), Math.round(param_positionX));
                } catch (IllegalAccessException ex) {
                    ex.printStackTrace();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }


                try {
                    field = c.getDeclaredField("y");
                } catch (NoSuchFieldException ex) {
                    ex.printStackTrace();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
                try {
                    field = c.getDeclaredField("topMargin");
                } catch (NoSuchFieldException ex) {
                    ex.printStackTrace();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }

                try {
                    field.setAccessible(true);
                    field.set(scannerView.getLayoutParams(), Math.round(param_positionY));
                } catch (IllegalAccessException ex) {
                    ex.printStackTrace();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }

            } else {
                ViewGroup.MarginLayoutParams scannerViewParams = new ViewGroup.MarginLayoutParams(Math.round(param_sizeWidth), Math.round(param_sizeHeight));
                scannerViewParams.leftMargin = Math.round(param_positionX);
                scannerViewParams.topMargin = Math.round(param_positionY);
                scannerView.setLayoutParams(scannerViewParams);
            }
        } catch (Exception ex) {
        }
    }

    private void addScannerView() {
        if (scannerView == null) {
            scannerView = new RelativeLayout(cordova.getActivity());
        }

        updateScannerViewPosition();

        if (scannerView.getParent() == null) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    getMainViewGroup().addView(scannerView);
                    updateScannerViewPosition();
                }
            });
        }
    }

    ViewGroup mainViewGroup = null;

    private ViewGroup getMainViewGroup() {
        if (mainViewGroup != null)
            return mainViewGroup;

        if (webView instanceof WebView) {
            mainViewGroup = (ViewGroup) webView;
            return (ViewGroup) webView;
        } else {
            try {
                java.lang.reflect.Method getView = webView.getClass().getMethod("getView");
                Object viewObject = getView.invoke(webView);
                if (viewObject instanceof View) {
                    mainViewGroup = (ViewGroup) viewObject;
                    return (ViewGroup) viewObject;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }

    private Boolean isReaderInit(CallbackContext callbackContext) {
        if (readerDevice != null) {
            return true;
        } else {
            if (callbackContext != null) {
                PluginResult pr = new PluginResult(PluginResult.Status.ERROR, "Reader device not initialized");
                pr.setKeepCallback(true);
                callbackContext.sendPluginResult(pr);
            }
            return false;
        }
    }

    private void updatePreviewContainerValues() {
        Display display = ((WindowManager) cordova.getActivity().getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay();
        final Point size = new Point();
        display.getSize(size);

        param_positionX = position_xp / 100 * size.x;
        param_positionY = position_yp / 100 * size.y;

        param_sizeWidth = position_wp / 100 * size.x;
        param_sizeHeight = position_hp / 100 * size.y;
    }


    private void setCameraMode(int cameraMode) {
        param_cameraMode = cameraMode;
//        Log.d("LAZYVLAD", String.valueOf(cameraMode));
    }

    private void setPreviewOptions(int previewOptions) {
        param_previewOptions = previewOptions;
    }

    ////////////////////////////////////////////////////
    //SDK API methods

    private void getAvailability(CallbackContext callbackContext) {
        ReaderDevice.Availability availability = (readerDevice != null) ? readerDevice.getAvailability() : null;
        callbackContext.success(availability.ordinal());
    }

    /**
     * @name connect
     * @desc Connect to the chosen Reader Device
     */
    private void connect(final CallbackContext callbackContext) {
        if (isReaderInit(callbackContext)) {
            readerDevice.connect(new ReaderDevice.OnConnectionCompletedListener() {
                @Override
                public void onConnectionCompleted(ReaderDevice readerDevice, Throwable throwable) {
                    if (throwable != null) {
                        Log.e("CMBScanner", "ReaderDevice failed to connect: " + throwable.getMessage());
                        PluginResult pr = new PluginResult(PluginResult.Status.ERROR, throwable.getMessage());
                        callbackContext.sendPluginResult(pr);
                    } else {
                        PluginResult pr = new PluginResult(PluginResult.Status.OK);
                        callbackContext.sendPluginResult(pr);
                    }
                }
            });
        }
    }

    private void registerSDK(String key) {
        ReaderDevice.setCameraRegistrationKey(key);
    }

    private void disconnect(CallbackContext callbackContext) {
        if (isReaderInit(callbackContext)) {
            readerDevice.disconnect();
            callbackContext.success();

        }
    }

    private void getConnectionState(CallbackContext callbackContext) {
        ConnectionState connectionState = (readerDevice != null) ? readerDevice.getConnectionState() : null;
        callbackContext.success(connectionState.ordinal());
    }


    private void startScanning(CallbackContext callbackContext) {
        //added by lazyvlad
//        scanningStateChangedCallbackId = callbackContext;
        //if there is a reader toggle the scanner and it's connected,
        // but if there isn't a reader we need to return a special callback which will contain false as a message
        if (readerDevice != null && readerDevice.getConnectionState().ordinal() == 2) {
            Log.d("lazyvlad", "startScanning: there is a connected reader ");
            setScannerViewHidden(false);
            toggleScanner(true);
        } else {
            Log.d("lazyvlad", "startScanning: there is NO READER return false ");
            PluginResult pr = new PluginResult(PluginResult.Status.ERROR, false);
//            pr.setKeepCallback(true);
            callbackContext.sendPluginResult(pr);
        }


    }

    //stop scanning callback will always return false, which is the state of the "SCANNER"
    //on the javascript side of things we use the same callback function for both startScanning and stopScanning
    //and a true value would mean the scanner is active, a false value would mean it's not
    private void stopScanning(CallbackContext callbackContext) {
        //added by lazyvlad to save the callback so when onReadResultReceived happens and we need to stop the scanner we can
        //have the proper callback
//        scanningStateChangedCallbackId = callbackContext;

        if (isReaderInit(callbackContext)) {
            setScannerViewHidden(true);
            toggleScanner(false);
        }
    }

    private void setScannerViewHidden(final boolean scannerViewHidden) {
        cordova.getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (scannerView != null)
                    scannerView.setVisibility(scannerViewHidden ? View.INVISIBLE : View.VISIBLE);
            }
        });
    }

    private void toggleScanner(boolean scan) {
        if (isReaderInit(scanningStateChangedCallbackId)) {
            if (scan) {
                readerDevice.getDataManSystem().sendCommand("GET TRIGGER.TYPE", new DataManSystem.OnResponseReceivedListener() {
                    @Override
                    public void onResponseReceived(DataManSystem dataManSystem, DmccResponse dmccResponse) {
                        param_triggerType = Integer.parseInt(dmccResponse.getPayLoad());
                    }
                });
                readerDevice.startScanning();
            } else {
                readerDevice.stopScanning();
            }
            isScanning = scan;

            if (scanningStateChangedCallbackId != null) {

                //added by lazyvlad on 1/3/2018, return to the startScanning/stopScanning methods if the scanner is on off
                //so the user on the javascript side can manipulate DOM elements based on the status of the scanner
                PluginResult pr = new PluginResult(PluginResult.Status.OK, isScanning);
                pr.setKeepCallback(true);
                scanningStateChangedCallbackId.sendPluginResult(pr);
            }

        }
    }

    private void beep(CallbackContext callbackContext) {
        if (isReaderInit(callbackContext)) {
            readerDevice.beep();
            callbackContext.success();
        }
    }

    private void getDeviceBatteryLevel(final CallbackContext callbackContext) {
        if (isReaderInit(callbackContext)) {
            readerDevice.getDeviceBatteryLevel(new ReaderDevice.OnDeviceBatteryLevelListener() {
                @Override
                public void onDeviceBatteryLevelReceived(ReaderDevice readerDevice, int i, Throwable throwable) {
                    if (throwable != null) {
                        callbackContext.error(throwable.getMessage());
                    } else {
                        callbackContext.success(i);
                    }
                }
            });
        }
    }

    private void setSymbologyEnabled(final CallbackContext callbackContext, final ReaderDevice.Symbology symbology, final boolean enable) {
        if (isReaderInit(callbackContext)) {
            readerDevice.setSymbologyEnabled(
                    symbology,
                    enable,
                    new ReaderDevice.OnSymbologyListener() {
                        @Override
                        public void onSymbologyEnabled(ReaderDevice readerDevice, ReaderDevice.Symbology symbology, Boolean aBoolean, Throwable throwable) {
                            if (throwable == null) {
                                callbackContext.success();
                            } else {
                                callbackContext.error(throwable.getMessage());
                            }
                        }
                    }
            );
        }
    }

    private void isSymbologyEnabled(final CallbackContext callbackContext, final ReaderDevice.Symbology symbology) {

        if (isReaderInit(callbackContext))
            readerDevice.isSymbologyEnabled(
                    symbology,
                    new ReaderDevice.OnSymbologyListener() {
                        @Override
                        public void onSymbologyEnabled(ReaderDevice readerDevice, ReaderDevice.Symbology symbology, Boolean aBoolean, Throwable throwable) {
                            if (throwable == null) {
                                callbackContext.success(aBoolean ? 1 : 0);
                            } else {
                                callbackContext.error(throwable.getMessage());
                            }
                        }
                    }
            );
    }

    private void setLightsOn(final CallbackContext callbackContext, final boolean on) {
        if (isReaderInit(callbackContext))
            readerDevice.setLightsOn(
                    on,
                    new ReaderDevice.OnLightsListener() {
                        @Override
                        public void onLightsOnCompleted(ReaderDevice readerDevice, Boolean aBoolean, Throwable throwable) {
                            if (throwable == null) {
                                callbackContext.success();
                            } else {
                                callbackContext.error(throwable.getMessage());
                            }
                        }
                    }
            );
    }

    private void isLightsOn(final CallbackContext callbackContext) {
        if (isReaderInit(callbackContext))
            readerDevice.isLightsOn(
                    new ReaderDevice.OnLightsListener() {
                        @Override
                        public void onLightsOnCompleted(ReaderDevice readerDevice, Boolean aBoolean, Throwable throwable) {
                            if (throwable == null) {
                                callbackContext.success();
                            } else {
                                callbackContext.error(throwable.getMessage());
                            }
                        }
                    }
            );
    }

    private void resetConfig(final CallbackContext callbackContext) {
        if (isReaderInit(callbackContext))
            readerDevice.resetConfig(
                    new ReaderDevice.OnResetConfigListener() {
                        @Override
                        public void onResetConfigCompleted(ReaderDevice readerDevice, Throwable throwable) {
                            if (throwable == null) {
                                callbackContext.success();
                            } else {
                                callbackContext.error(throwable.getMessage());
                            }
                        }
                    }
            );
    }

    private void sendCommand(final CallbackContext callbackContext, String commandString) {
        if (isReaderInit(callbackContext))
            readerDevice.getDataManSystem().sendCommand(
                    commandString,
                    new DataManSystem.OnResponseReceivedListener() {
                        @Override
                        public void onResponseReceived(DataManSystem dataManSystem, DmccResponse dmccResponse) {
                            if (dmccResponse.getError() == null) {
                                PluginResult pr = new PluginResult(PluginResult.Status.OK, dmccResponse.getPayLoad());
                                pr.setKeepCallback(true);
                                callbackContext.sendPluginResult(pr);
                            } else {
                                PluginResult pr = new PluginResult(PluginResult.Status.ERROR, dmccResponse.getPayLoad());
                                pr.setKeepCallback(true);
                                callbackContext.sendPluginResult(pr);
                            }
                        }
                    });
    }

    @Override
    public void onConnectionStateChanged(ReaderDevice readerDevice) {
        if (connectionStateDidChangeOfReaderCallbackID != null) {
            PluginResult pr = new PluginResult(PluginResult.Status.OK, readerDevice.getConnectionState().ordinal());
            pr.setKeepCallback(true);
            connectionStateDidChangeOfReaderCallbackID.sendPluginResult(pr);
        }
    }

    @Override
    public void onReadResultReceived(ReaderDevice readerDevice, ReadResults readResults) {
//        LOG.d("Lazyvlad",readResults.getResultAt(0).getReadString());
        if (didReceiveReadResultFromReaderCallbackID != null) {
            if (readResults.getCount() > 0) {
                ReadResult result = readResults.getResultAt(0);

                if (result.isGoodRead()) {

                    JSONObject jsonResult = new JSONObject();
                    try {
                        jsonResult.put("symbology", result.getSymbology().ordinal());
                        jsonResult.put("symbologyString", result.getSymbology());
                        jsonResult.put("readString", result.getReadString());

                        if (result.getXml() != null) {
                            jsonResult.put("xml", result.getXml());
                        }
                        if (result.getImageGraphics() != null) {
                            jsonResult.put("imageGraphics", result.getImageGraphics());
                        }

                        if (result.getImage() != null) {
                            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                            result.getImage().compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
                            byte[] byteArray = byteArrayOutputStream.toByteArray();

                            String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

                            jsonResult.put("image", encoded);
                        }

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }

                    PluginResult pr = new PluginResult(PluginResult.Status.OK, jsonResult);
                    pr.setKeepCallback(true);
                    didReceiveReadResultFromReaderCallbackID.sendPluginResult(pr);
                } else {

                    JSONObject jsonResult = new JSONObject();
                    try {
                        jsonResult.put("symbology", -1);
                        jsonResult.put("symbologyString", "NO READ");
                        jsonResult.put("readString", "");
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }

                    PluginResult pr = new PluginResult(PluginResult.Status.OK, jsonResult);
                    pr.setKeepCallback(true);
                    didReceiveReadResultFromReaderCallbackID.sendPluginResult(pr);
                }
                if (param_triggerType == 2)
                    stopScanning(scanningStateChangedCallbackId);
                //by @lazyvlad, notify the JS side that we stopped scanning
            }

            if (param_triggerType == 2) {
                isScanning = false;
                stopScanning(scanningStateChangedCallbackId);
            }
        }
    }

    @Override
    public void onAvailabilityChanged(ReaderDevice readerDevice) {
        if (availabilityDidChangeOfReaderCallbackID != null) {
            PluginResult pr = new PluginResult(PluginResult.Status.OK, readerDevice.getAvailability().ordinal());
            pr.setKeepCallback(true);
            availabilityDidChangeOfReaderCallbackID.sendPluginResult(pr);
        }
    }

    //////////////////////////////////////////////////////////

    // HANDLE SCREEN ORIENTATION
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        if (scannerView != null) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    updatePreviewContainerValues();
                    updateScannerViewPosition();

                    if (isScanning) {
                        stopScanning(scanningStateChangedCallbackId);
                    }
                }
            });
        }
    }

    // Camera Permission
    public void onRequestPermissionResult(int requestCode, String[] permissions,
                                          int[] grantResults) throws JSONException {

        if (requestCode == 234 && (grantResults.length > 0
                && grantResults[0] != PackageManager.PERMISSION_GRANTED)) {
            try {
                if (shouldShowRequestPermissionRationale(cordova.getActivity(), Manifest.permission.CAMERA)) {
                    new AlertDialog.Builder(cordova.getActivity())
                            .setMessage(
                                    "You need to allow access to the Camera")
                            .setPositiveButton("OK",
                                    new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(
                                                DialogInterface dialogInterface,
                                                int i) {
                                            cordova.requestPermission(ScannerBridge.this, 234, Manifest.permission.CAMERA);
                                        }
                                    })
                            .setNegativeButton("Cancel",
                                    new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(
                                                DialogInterface dialogInterface,
                                                int i) {
                                            readerDevice.disconnect();
                                        }
                                    }).setCancelable(false).create().show();
                } else {
                    new AlertDialog.Builder(cordova.getActivity())
                            .setMessage(
                                    "Please enable camera permission to use this app")
                            .setNegativeButton("Cancel",
                                    new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(
                                                DialogInterface dialogInterface,
                                                int i) {
                                            readerDevice.disconnect();
                                        }
                                    }).setCancelable(false).create().show();
                }
            } catch (Exception e) {
                new AlertDialog.Builder(cordova.getActivity())
                        .setMessage(
                                "Please enable camera permission to use this app")
                        .setNegativeButton("Cancel",
                                new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(
                                            DialogInterface dialogInterface,
                                            int i) {
                                        readerDevice.disconnect();
                                    }
                                }).setCancelable(false).create().show();
            }
        }
    }

    private boolean shouldShowRequestPermissionRationale(Activity activity, String permission) throws Exception {
        boolean shouldShow;
        try {
            java.lang.reflect.Method method = ActivityCompat.class.getMethod("shouldShowRequestPermissionRationale", Activity.class, java.lang.String.class);
            Boolean bool = (Boolean) method.invoke(null, activity, permission);
            shouldShow = bool.booleanValue();
        } catch (NoSuchMethodException e) {
            throw new Exception("shouldShowRequestPermissionRationale() method not found in ActivityCompat class. Check you have Android Support Library v23+ installed");
        }
        return shouldShow;
    }
}