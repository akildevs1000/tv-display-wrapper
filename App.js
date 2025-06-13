import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Platform,
  View,
  TextInput,
  Button,
  BackHandler,
  ToastAndroid
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as SecureStore from 'expo-secure-store';

export default function App() {
  const [url, setUrl] = useState('');
  const [finalUrl, setFinalUrl] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const backPressCount = useRef(0);
  const timeoutRef = useRef(null);

  // Load saved URL on startup
  useEffect(() => {
    (async () => {
      const savedUrl = await SecureStore.getItemAsync('webview_url');
      if (savedUrl) {
        setUrl(savedUrl);
        setFinalUrl(savedUrl);
      } else {
        setShowInput(true);
      }
    })();
  }, []);

  // Back button logic for remote
  useEffect(() => {
    const backAction = () => {
      backPressCount.current += 1;

      if (backPressCount.current === 1) {
        ToastAndroid.show('Press back 3 times to change URL', ToastAndroid.SHORT);
        timeoutRef.current = setTimeout(() => (backPressCount.current = 0), 5000);
        return true;
      }

      if (backPressCount.current === 3) {
        clearTimeout(timeoutRef.current);
        backPressCount.current = 0;
        setShowInput(true);
        return true;
      }

      return true; // block back normally
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleSaveUrl = async () => {
    setFinalUrl(url);
    await SecureStore.setItemAsync('webview_url', url);
    setShowInput(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {showInput ? (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="Enter URL"
            placeholderTextColor="#999"
            autoFocus
          />
          <Button title="Load URL" onPress={handleSaveUrl} />
        </View>
      ) : finalUrl ? (
        <WebView
          source={{ uri: finalUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 0 : 30,
    backgroundColor: '#fff'
  },
  inputWrapper: {
    padding: 20,
    justifyContent: 'center',
    flex: 1
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10
  }
});
