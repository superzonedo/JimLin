import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useUserStore } from "@/state/userStore";
import { useSafeBack } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

// 完成 WebBrowser 認證會話
WebBrowser.maybeCompleteAuthSession();
import { auth, db } from "@/lib/firebase";
import { signInWithCustomToken, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { TextInput, ScrollView } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 
  'https://us-central1-lablex-api.cloudfunctions.net';

const GOOGLE_CLIENT_ID_IOS =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
  "your-ios-client-id.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID_ANDROID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  "your-android-client-id.apps.googleusercontent.com";
const GOOGLE_CLIENT_ID_WEB =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "your-web-client-id.apps.googleusercontent.com";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setLoggedIn = useUserStore((state) => state.setLoggedIn);
  const safeBack = useSafeBack();
  const { t, language } = useLanguage();
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    // Check if Apple Authentication is available
    AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
  }, []);

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 檢查是否支援 Apple 登入
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(t('login.appleNotSupported'), t('login.appleNotSupportedMessage'));
        setIsLoading(false);
        return;
      }

      // 發起 Apple 登入
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error(t('login.cannotGetToken'));
      }

      // 準備用戶信息
      const userInfo: any = {};
      
      // 只有當 email 存在時才添加
      if (credential.email) {
        userInfo.email = credential.email;
      }
      
      // 只有當 fullName 存在時才添加
      if (credential.fullName) {
        userInfo.fullName = {};
        if (credential.fullName.givenName) {
          userInfo.fullName.givenName = credential.fullName.givenName;
        }
        if (credential.fullName.familyName) {
          userInfo.fullName.familyName = credential.fullName.familyName;
        }
        // 如果 fullName 對象為空，則不添加
        if (Object.keys(userInfo.fullName).length === 0) {
          delete userInfo.fullName;
        }
      }

      // 發送到後端驗證
      console.log('📤 發送 Apple 登入請求到後端...', {
        hasIdentityToken: !!credential.identityToken,
        hasEmail: !!credential.email,
        hasFullName: !!credential.fullName,
      });
      
      const response = await fetch(`${API_BASE_URL}/verifyAppleLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          user: Object.keys(userInfo).length > 0 ? userInfo : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `${t('login.verifyFailed')}: ${response.status}`;
        console.error('Apple 登入後端驗證失敗:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success || !data.customToken) {
        throw new Error(data.message || data.error || t('login.verifyFailed'));
      }

      // 使用 custom token 登入 Firebase
      console.log('🔐 使用 custom token 登入 Firebase...');
      let userCredential;
      try {
        userCredential = await signInWithCustomToken(auth, data.customToken);
        console.log('✅ Firebase 登入成功');
      } catch (firebaseError: any) {
        console.error('❌ Firebase 登入失敗:', firebaseError);
        throw new Error(`${t('login.firebaseLoginFailed')}: ${firebaseError.message || t('login.verifyFailed')}`);
      }

      const user = userCredential.user;

      // 更新用戶狀態（後端已經保存到 Firestore，這裡不需要重複保存）
      // 確保 displayName 永遠是有效的字串
      let displayName = data.displayName;
      if (!displayName || displayName.trim() === '') {
        // 嘗試從 credential 獲取
        if (credential.fullName) {
          const fullName = `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim();
          if (fullName) {
            displayName = fullName;
          }
        }
        // 如果還是沒有，嘗試從 Firebase user 獲取
        if (!displayName && user.displayName) {
          displayName = user.displayName;
        }
        // 最後的默認值
        if (!displayName || displayName.trim() === '') {
          displayName = t('login.user');
        }
      }

      console.log('📝 更新用戶狀態...');
      setLoggedIn(true, displayName, data.email || user.email || undefined);
      console.log('✅ 用戶狀態已更新');

      console.log('✅ Apple 登入成功!', {
        userId: data.userId,
        email: data.email,
        displayName: displayName,
      });

      // 登入成功後跳轉到首頁
      console.log('🔄 跳轉到首頁...');
      try {
        router.replace('/(tabs)/home');
        console.log('✅ 導航成功');
      } catch (navError: any) {
        console.error('❌ 導航失敗:', navError);
        // 導航失敗不應該阻止登入成功，只記錄錯誤
      }
      
      // 可選：顯示成功提示（不阻塞導航）
      setTimeout(() => {
        Alert.alert(t('login.loginSuccess'), t('login.welcomeLabelX'));
      }, 300);
    } catch (e: any) {
      if (e.code === "ERR_CANCELED") {
        console.log('ℹ️ 用戶取消了 Apple 登入');
        // 用戶取消不需要顯示錯誤
      } else {
        console.error('❌ Apple 登入錯誤:', e);
        console.error('錯誤詳情:', {
          code: e.code,
          message: e.message,
          stack: e.stack,
        });
        const errorMessage = e.message || t('login.appleLoginFailed');
        setError(errorMessage);
        setShowErrorModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      if (!googleClientId || googleClientId.includes('your-') || googleClientId.trim() === '') {
        Alert.alert(
          t('login.configIncomplete'),
          t('login.configIncompleteMessage'),
          [{ text: t('login.ok') }]
        );
        setIsLoading(false);
        return;
      }

      // 配置 Google OAuth
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      // 根據平台設置 redirect URI
      // Web 環境：優先使用 Expo proxy，否則使用當前 origin
      let redirectUri: string;
      
      if (Platform.OS === 'web') {
        // Web 環境：嘗試多種方式以確保兼容性
        redirectUri = AuthSession.makeRedirectUri({
          useProxy: true, // 使用 Expo proxy 更穩定
        });
        
        // 如果 proxy 不可用，回退到直接 URI
        if (!redirectUri || redirectUri === '') {
          redirectUri = AuthSession.makeRedirectUri({
            useProxy: false,
          });
        }
        
        // 確保是完整的 URI（包含協議和端口）
        if (redirectUri && !redirectUri.startsWith('http')) {
          // 如果生成的是相對路徑，使用當前頁面的 origin
          const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
          redirectUri = `${currentOrigin}${redirectUri}`;
        }
      } else {
        // 原生環境：使用自定義 scheme
        redirectUri = AuthSession.makeRedirectUri({
          scheme: 'labelx',
          useProxy: false,
        });
      }

      console.log('🔵 使用的 Redirect URI:', redirectUri);
      console.log('🔵 Platform:', Platform.OS);

      // 創建授權請求（使用 Authorization Code Flow with PKCE）
      const request = new AuthSession.AuthRequest({
        clientId: googleClientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: redirectUri,
        usePKCE: true,
      });

      // 發起授權請求
      // Web 環境使用 proxy，原生環境不使用
      const result = await request.promptAsync(discovery, {
        useProxy: Platform.OS === 'web',
      });

      if (result.type !== 'success') {
        if (result.type === 'cancel') {
          console.log('用戶取消了 Google 登入');
        } else {
          console.error('Google 登入失敗:', result);
        }
        setIsLoading(false);
        return;
      }

      const { code } = result.params;

      if (!code) {
        throw new Error(t('login.cannotGetCode'));
      }

      // 通過後端交換 authorization code 為 id token
      console.log('🔵 通過後端交換 authorization code 為 id token...');
      const tokenResponse = await fetch(`${API_BASE_URL}/exchangeGoogleCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirectUri: request.redirectUri || redirectUri,
          codeVerifier: request.codeVerifier,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.details || `Token 交換失敗: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const idToken = tokenData.idToken;

      if (!idToken) {
        throw new Error(t('login.cannotGetIdToken'));
      }

      // 發送到後端驗證並獲取 custom token
      console.log('🔵 發送到後端驗證...');
      const verifyResponse = await fetch(`${API_BASE_URL}/verifyGoogleLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: idToken,
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.details || `驗證失敗: ${verifyResponse.status}`);
      }

      const verifyData = await verifyResponse.json();

      if (!verifyData.success || !verifyData.customToken) {
        throw new Error(verifyData.message || '驗證失敗');
      }

      // 使用 custom token 登入 Firebase
      console.log('🔐 使用 custom token 登入 Firebase...');
      const userCredential = await signInWithCustomToken(auth, verifyData.customToken);
      const user = userCredential.user;

      // 更新用戶狀態
      const displayName = verifyData.displayName || user.displayName || user.email?.split('@')[0] || '用戶';
      setLoggedIn(true, displayName, verifyData.email || user.email || undefined);

      console.log('✅ Google 登入成功!', {
        userId: verifyData.userId,
        email: verifyData.email,
        displayName: displayName,
      });

      // 登入成功後跳轉到首頁
      router.replace('/(tabs)/home');
      
      // 可選：顯示成功提示（不阻塞導航）
      setTimeout(() => {
        Alert.alert(t('login.loginSuccess'), t('login.welcomeLabelX'));
      }, 300);
    } catch (e: any) {
      console.error('❌ Google 登入錯誤:', e);
      console.error('錯誤詳情:', {
        code: e.code,
        message: e.message,
        stack: e.stack,
      });
      const errorMessage = e.message || t('login.googleLoginFailed');
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError(t('login.pleaseEnterEmailPassword'));
      setShowErrorModal(true);
      return;
    }

    if (email.length < 5 || !email.includes("@")) {
      setError(t('login.invalidEmail'));
      setShowErrorModal(true);
      return;
    }

    if (password.length < 6) {
      setError(t('login.passwordTooShort'));
      setShowErrorModal(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let userCredential;
      if (isSignUp) {
        // 註冊新用戶
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // 登入現有用戶
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;

      // 如果是註冊，更新用戶顯示名稱
      if (isSignUp) {
        const nameToUse = displayName.trim() || email.split("@")[0];
        await updateProfile(user, {
          displayName: nameToUse,
        });
      }

      // 保存用戶信息到 Firestore
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // 新用戶，創建文檔
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName || email.split("@")[0],
            provider: "email",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          // 現有用戶，更新信息
          await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName || email.split("@")[0],
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (firestoreError) {
        console.warn("保存用戶信息到 Firestore 失敗:", firestoreError);
        // 不影響登入流程，繼續執行
      }

      // 更新用戶狀態
      const userNameToUse = user.displayName || displayName.trim() || email.split("@")[0];
      setLoggedIn(true, userNameToUse, user.email || undefined);

      console.log("✅ 電子郵件登入成功!", {
        userId: user.uid,
        email: user.email,
        displayName: userNameToUse,
      });

      // 登入成功後跳轉到首頁
      router.replace("/(tabs)/home");
      
      // 可選：顯示成功提示（不阻塞導航）
      setTimeout(() => {
        Alert.alert(
          isSignUp ? t('login.signUpSuccess') : t('login.loginSuccess'),
          isSignUp ? t('login.welcomeJoin') : t('login.welcomeBack')
        );
      }, 300);
    } catch (error: any) {
      console.error("電子郵件登入錯誤:", error);
      let errorMessage = t('login.loginFailedGeneric');
      
      if (error.code === "auth/user-not-found") {
        errorMessage = t('login.accountNotFound');
      } else if (error.code === "auth/wrong-password") {
        errorMessage = t('login.wrongPassword');
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = t('login.emailAlreadyInUse');
      } else if (error.code === "auth/weak-password") {
        errorMessage = t('login.weakPassword');
      } else if (error.code === "auth/invalid-email") {
        errorMessage = t('login.invalidEmailFormat');
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = t('login.invalidCredential');
      }
      
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Pressable
          onPress={() => {
            // TODO: 實現聯絡我們功能
            Alert.alert(t('login.contactUs') || '聯絡我們', '聯絡我們功能開發中');
          }}
          style={styles.contactButton}
        >
          <Text style={styles.contactButtonText}>{t('login.contactUs') || '聯絡我們'}</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Label Dog</Text>
          <Text style={styles.subtitle}>{t('login.tagline')}</Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.loginButtons}>
          {/* Google Sign In Button */}
          <Pressable
            style={styles.unifiedButton}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#001858" />
            ) : (
              <>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.unifiedButtonText}>{t('login.useGoogleLogin')}</Text>
              </>
            )}
          </Pressable>

          {/* Apple Sign In Button */}
          {isAppleAvailable && (
            <Pressable
              style={styles.unifiedButton}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#001858" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#000000" />
                  <Text style={styles.unifiedButtonText}>{t('login.useAppleLogin')}</Text>
                </>
              )}
            </Pressable>
          )}

          {/* Password Login Button */}
          <Pressable
            style={styles.unifiedButton}
            onPress={() => setShowEmailForm(true)}
            disabled={isLoading}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#001858" />
            <Text style={styles.unifiedButtonText}>{t('login.passwordLogin') || '密碼登入'}</Text>
          </Pressable>

          {/* Register Button */}
          <Pressable
            style={styles.unifiedButton}
            onPress={() => {
              setShowEmailForm(true);
              setIsSignUp(true);
            }}
            disabled={isLoading}
          >
            <Text style={styles.unifiedButtonText}>{t('login.signUp')}</Text>
          </Pressable>
        </View>

        {/* Email Form */}
        {showEmailForm ? (
          <View style={styles.emailForm}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder={t('login.displayNamePlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder={t('login.emailPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('login.passwordPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
            
            <Pressable
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? t('login.signUpButton') : t('login.loginButton')}
                </Text>
              )}
            </Pressable>
            
            <Pressable
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setPassword("");
                setError(null);
              }}
              disabled={isLoading}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp ? t('login.alreadyHaveAccount') : t('login.noAccount')}
              </Text>
            </Pressable>
            
            <Pressable
              style={styles.backButton}
              onPress={() => {
                setShowEmailForm(false);
                setEmail("");
                setPassword("");
                setDisplayName("");
                setError(null);
              }}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>{t('login.back')}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              {t('login.termsText') || '我已閱讀並同意 '}
              <Text style={styles.termsLink}>{t('login.userAgreement') || '用戶協議'}</Text>
              {' '}{t('login.and') || '與'}{' '}
              <Text style={styles.termsLink}>{t('login.privacyPolicy') || '隱私政策'}</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.modalTitle}>{t('login.loginFailed')}</Text>
            <Text style={styles.modalMessage}>{error}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>{t('login.okButton')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contactButton: {
    paddingVertical: 8,
  },
  contactButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  emailForm: {
    width: "100%",
    gap: 20,
    marginTop: 40,
    paddingTop: 20,
  },
  emailFormTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001858",
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#001858",
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: "#2CB67D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  switchButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  switchButtonText: {
    fontSize: 14,
    color: "#2CB67D",
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: 8,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 120,
    marginTop: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 0,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#001858",
    marginTop: -8,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 0,
  },
  loginButtons: {
    gap: 12,
    marginBottom: 24,
  },
  unifiedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  unifiedButtonText: {
    color: "#001858",
    fontSize: 16,
    fontWeight: "600",
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
  },
  googleIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  termsContainer: {
    marginTop: "auto",
    marginBottom: 20,
    alignItems: "center",
    paddingTop: 40,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 320,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#001858",
    borderColor: "#001858",
  },
  termsText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    flex: 1,
  },
  termsLink: {
    color: "#001858",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001858",
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#001858",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

