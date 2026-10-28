import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const pendingActions = [];

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    try {
      navigationRef.navigate(name, params);
    } catch (e) {
      console.log('Navigation error for route:', name, e);
    }
  } else {
    pendingActions.push(() => {
      try {
        navigationRef.navigate(name, params);
      } catch (e) {
        console.log('Queued navigation error for route:', name, e);
      }
    });
  }
}

export function reset(name, params) {
  if (navigationRef.isReady()) {
    try {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name,
              params,
            },
          ],
        }),
      );
    } catch (e) {
      console.log('Reset navigation error:', e);
    }
  } else {
    pendingActions.push(() => {
      reset(name, params);
    });
  }
}

export function onNavigationReady() {
  console.log('NavigationContainer is ready. Processing queued actions:', pendingActions.length);
  while (pendingActions.length > 0) {
    const action = pendingActions.shift();
    try {
      action();
    } catch (e) {
      console.log('Error executing queued action:', e);
    }
  }
}
