/**
 * @author f.ulusoy
 * created on 26.01.2017
 */
(function() {
  'use strict';

  angular.module('BlurAdmin.pages.devices').controller('DeviceEditCtrl', DeviceEditCtrl);

  function DeviceEditCtrl($state, $stateParams, toastr, uuid4, deviceService, geoJsonHandler, gmapsHandler) {
    const vm = this;
    vm.device = {};
    vm.actions = ["WaterLeakAction"];

    if ($stateParams.deviceId && $stateParams.deviceId !== 'new') {
      deviceService.find($stateParams.deviceId).success(function(device) {
        vm.device = device;
        vm.device.address = (device.location && device.location.properties )
          ? device.location.properties.address : '';
        showInMap(device);
      });
    } else {
      vm.isNewDevice = true;
      vm.device = {
        type: 'gateway'
      };
    }

    const showInMap = function(device) {
      gmapsHandler.initGmaps();
      if (device.location
        && device.location.geometry
        && device.location.geometry.coordinates) {
        gmapsHandler.showInMap({
          type: 'latLng',
          latLng: {
            lat: device.location.geometry.coordinates[0],
            lng: device.location.geometry.coordinates[1]
          }
        });
      }
    };

    vm.saveDevice = function() {
      geoJsonHandler.prepareLocation(vm.device.address, function(location) {
        vm.device.location = location;
        delete vm.device.address;
        deviceService.save(vm.device).success(function(savedDevice) {
          _.merge(vm.device, savedDevice);
          vm.device.address = (savedDevice.location && savedDevice.location.properties )
            ? savedDevice.location.properties.address : '';
          showInMap(savedDevice);
          toastr.success(null, "Saving device is successful.");
          $state.go('main.devices');
        }).error(function(err) {
          toastr.error("Saving device has failed!", "Error")
        });
      });
    };

    vm.validateJson = function(key, errorKey) {
      if (!vm.device[key]) {
        vm[errorKey] = 'not valid json';
      } else {
        vm[errorKey] = '';
      }
    };

  }

})();
