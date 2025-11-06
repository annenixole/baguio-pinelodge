import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Card,
    CardContent,
    Divider,
    IconButton,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { Edit, PhotoCamera, DeleteForever, PersonOff } from '@mui/icons-material';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, deleteDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

export default function ProfileSettings() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        email: '',
        photoURL: '',
        phoneNumber: '',
        paypalEmail: '',
        bio: ''
    });
    const [notifications, setNotifications] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Password change states
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Delete/Deactivate account states
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [deactivateDialog, setDeactivateDialog] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchUserData();
        const user = auth.currentUser;
        if (user) {
            loadNotifications(user.uid);
        }
    }, []);

    const loadNotifications = async (userId) => {
        try {
            const notificationsRef = collection(db, "users", userId, "notifications");
            let querySnapshot;
            try {
                const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(10));
                querySnapshot = await getDocs(q);
            } catch (orderError) {
                const q = query(notificationsRef, limit(10));
                querySnapshot = await getDocs(q);
            }
            const notificationsList = [];
            querySnapshot.forEach((doc) => {
                notificationsList.push({ id: doc.id, ...doc.data() });
            });
            notificationsList.sort((a, b) => {
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return bTime - aTime;
            });
            setNotifications(notificationsList);
            const unreadCount = notificationsList.filter(n => !n.read).length;
            setNotificationsCount(unreadCount);
        } catch (error) {
            console.error("❌ Error loading notifications:", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            const user = auth.currentUser;
            if (user && !notification.read) {
                const notificationRef = doc(db, "users", user.uid, "notifications", notification.id);
                await updateDoc(notificationRef, { read: true });
                await loadNotifications(user.uid);
            }
        } catch (error) {
            console.error("Error handling notification click:", error);
        }
    };

    const handleRefreshNotifications = () => {
        const user = auth.currentUser;
        if (user) {
            loadNotifications(user.uid);
        }
    };

    const fetchUserData = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                console.log('🔍 Fetching user data for:', user.email);
                // Use email as document ID instead of UID
                const userDocRef = doc(db, 'users', user.email);
                const userDoc = await getDoc(userDocRef);
                
                console.log('📄 User document exists:', userDoc.exists());
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('✅ User data found:', userData);
                    setUserInfo({
                        displayName: userData.firstName || userData.name || user.displayName || '',
                        email: user.email || userData.email || '',
                        photoURL: userData.photoURL || user.photoURL || '',
                        phoneNumber: userData.phoneNumber || '',
                        paypalEmail: userData.paypalEmail || '',
                        bio: userData.bio || ''
                    });
                } else {
                    // If no Firestore doc exists, use Auth data
                    console.log('⚠️ No user document found, using Auth data');
                    setUserInfo({
                        displayName: user.displayName || '',
                        email: user.email || '',
                        photoURL: user.photoURL || '',
                        phoneNumber: '',
                        paypalEmail: '',
                        bio: ''
                    });
                }
            } else {
                console.error('❌ No user logged in');
            }
        } catch (error) {
            console.error('❌ Error fetching user data:', error);
            showSnackbar('Error loading profile data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                console.log('💾 Saving profile for:', user.email);
                
                // Update Firebase Auth profile
                await updateProfile(user, {
                    displayName: userInfo.displayName,
                    photoURL: userInfo.photoURL
                });

                // Update Firestore document using email as document ID
                // Using setDoc with merge:true to create document if it doesn't exist
                const userDocRef = doc(db, 'users', user.email);
                await setDoc(userDocRef, {
                    email: user.email, // Ensure email is stored
                    name: userInfo.displayName,
                    phoneNumber: userInfo.phoneNumber,
                    paypalEmail: userInfo.paypalEmail,
                    bio: userInfo.bio,
                    photoURL: userInfo.photoURL,
                    updatedAt: new Date()
                }, { merge: true }); // merge:true will update existing or create new

                console.log('✅ Profile updated successfully');
                showSnackbar('Profile updated successfully!', 'success');
                setIsEditing(false);
            }
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            console.error('Error details:', error.message);
            showSnackbar(`Failed to update profile: ${error.message}`, 'error');
        }
    };

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showSnackbar('File size must be less than 5MB', 'error');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            showSnackbar('Please upload an image file', 'error');
            return;
        }

        try {
            const user = auth.currentUser;
            console.log('📸 Uploading photo for user:', user.email);
            const storageRef = ref(storage, `profile-photos/${user.email}/${Date.now()}_${file.name}`);
            
            // Upload file
            await uploadBytes(storageRef, file);
            console.log('✅ Photo uploaded to storage');
            
            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);
            console.log('🔗 Got download URL:', downloadURL);
            
            // Update state
            setUserInfo(prev => ({
                ...prev,
                photoURL: downloadURL
            }));

            // Update Firebase Auth profile
            await updateProfile(user, {
                photoURL: downloadURL
            });

            // Update Firestore - use setDoc with merge to create if doesn't exist
            const userDocRef = doc(db, 'users', user.email);
            await setDoc(userDocRef, {
                photoURL: downloadURL,
                updatedAt: new Date()
            }, { merge: true });
            console.log('✅ Photo URL saved to Firestore');

            showSnackbar('Profile photo updated successfully!', 'success');
        } catch (error) {
            console.error('Error uploading photo:', error);
            showSnackbar(`Failed to upload photo: ${error.message}`, 'error');
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showSnackbar('New passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showSnackbar('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(
                user.email,
                passwordData.currentPassword
            );

            // Re-authenticate user
            await reauthenticateWithCredential(user, credential);
            
            // Update password
            await updatePassword(user, passwordData.newPassword);

            showSnackbar('Password updated successfully!', 'success');
            setShowPasswordChange(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.code === 'auth/wrong-password') {
                showSnackbar('Current password is incorrect', 'error');
            } else {
                showSnackbar('Failed to change password', 'error');
            }
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleDeactivateAccount = async () => {
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(
                user.email,
                confirmPassword
            );

            // Re-authenticate user
            await reauthenticateWithCredential(user, credential);
            
            console.log('🔒 Deactivating account for:', user.email);
            // Update user status in Firestore - use setDoc with merge
            const userDocRef = doc(db, 'users', user.email);
            await setDoc(userDocRef, {
                isActive: false,
                deactivatedAt: new Date()
            }, { merge: true });
            console.log('✅ Account deactivated in Firestore');

            showSnackbar('Account deactivated successfully', 'success');
            setDeactivateDialog(false);
            setConfirmPassword('');
            
            // Sign out after deactivation
            setTimeout(() => {
                auth.signOut();
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('Error deactivating account:', error);
            if (error.code === 'auth/wrong-password') {
                showSnackbar('Incorrect password', 'error');
            } else {
                showSnackbar('Failed to deactivate account', 'error');
            }
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(
                user.email,
                confirmPassword
            );

            // Re-authenticate user
            await reauthenticateWithCredential(user, credential);
            
            console.log('🗑️ Deleting account for:', user.email);
            // Delete user document from Firestore
            const userDocRef = doc(db, 'users', user.email);
            await deleteDoc(userDocRef);
            console.log('✅ User document deleted from Firestore');

            // Delete user from Firebase Auth
            await deleteUser(user);
            console.log('✅ User deleted from Firebase Auth');

            showSnackbar('Account deleted successfully', 'success');
            setDeleteDialog(false);
            setConfirmPassword('');
            
            // Redirect to home page
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error('Error deleting account:', error);
            if (error.code === 'auth/wrong-password') {
                showSnackbar('Incorrect password', 'error');
            } else {
                showSnackbar('Failed to delete account', 'error');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Loading profile...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header with Profile Menu */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#000' }}>
                    Profile Settings
                </Typography>
                {userInfo.email && (
                    <ProfileMenu 
                        userEmail={userInfo.email}
                        notifications={notifications}
                        notificationsCount={notificationsCount}
                        onNotificationClick={handleNotificationClick}
                        onRefreshNotifications={handleRefreshNotifications}
                    />
                )}
            </Box>

            {/* Profile Card */}
            <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Profile Header with Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={userInfo.photoURL}
                                    sx={{ width: 80, height: 80, bgcolor: '#70873F', fontSize: '2rem' }}
                                >
                                    {userInfo.displayName?.charAt(0)?.toUpperCase()}
                                </Avatar>
                                {isEditing && (
                                    <>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="photo-upload"
                                            type="file"
                                            onChange={handlePhotoUpload}
                                        />
                                        <label htmlFor="photo-upload">
                                            <IconButton
                                                component="span"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: -5,
                                                    right: -5,
                                                    bgcolor: '#fff',
                                                    border: '2px solid #70873F',
                                                    '&:hover': { bgcolor: '#f5f5f5' },
                                                    width: 32,
                                                    height: 32
                                                }}
                                            >
                                                <PhotoCamera sx={{ fontSize: 16, color: '#70873F' }} />
                                            </IconButton>
                                        </label>
                                    </>
                                )}
                            </Box>
                            <Box sx={{ ml: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#000' }}>
                                    {userInfo.displayName || 'Vaden Vovo'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    {userInfo.email}
                                </Typography>
                            </Box>
                        </Box>
                        {!isEditing && (
                            <Button
                                variant="contained"
                                onClick={() => setIsEditing(true)}
                                sx={{
                                    bgcolor: '#E67E22',
                                    color: '#fff',
                                    textTransform: 'none',
                                    borderRadius: 1,
                                    px: 3,
                                    '&:hover': { bgcolor: '#D35400' }
                                }}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Personal Information */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#000' }}>
                        Personal Information
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                        <TextField
                            label="Full Name"
                            name="displayName"
                            value={userInfo.displayName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Email"
                            value={userInfo.email}
                            disabled
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Phone number"
                            name="phoneNumber"
                            value={userInfo.phoneNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Paypal Email"
                            name="paypalEmail"
                            value={userInfo.paypalEmail}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            fullWidth
                            variant="outlined"
                        />
                    </Box>

                    <TextField
                        label="Bio"
                        name="bio"
                        value={userInfo.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />

                    {isEditing && (
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchUserData();
                                }}
                                sx={{ 
                                    color: '#666', 
                                    borderColor: '#ddd',
                                    textTransform: 'none'
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSaveProfile}
                                sx={{
                                    bgcolor: '#E67E22',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#D35400' }
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card sx={{ borderRadius: 2, boxShadow: 1, mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000' }}>
                        Security
                    </Typography>

                    {!showPasswordChange ? (
                        <Button
                            variant="outlined"
                            onClick={() => setShowPasswordChange(true)}
                            sx={{ 
                                color: '#666', 
                                borderColor: '#ddd',
                                textTransform: 'none'
                            }}
                        >
                            Change Password
                        </Button>
                    ) : (
                        <Box>
                            <TextField
                                label="Current Password"
                                name="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="New Password"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 3 }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setShowPasswordChange(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    sx={{ 
                                        color: '#666', 
                                        borderColor: '#ddd',
                                        textTransform: 'none'
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleChangePassword}
                                    sx={{
                                        bgcolor: '#E67E22',
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#D35400' }
                                    }}
                                >
                                    Update Password
                                </Button>
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Account Management Card */}
            <Card sx={{ borderRadius: 2, boxShadow: 1, mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#000' }}>
                        Account Management
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Deactivate Account */}
                        <Box sx={{ 
                            p: 2, 
                            border: '1px solid #FFB74D', 
                            borderRadius: 1,
                            bgcolor: '#FFF3E0'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PersonOff sx={{ color: '#F57C00', mr: 1 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Deactivate Account
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                Temporarily disable your account. You can reactivate it anytime by logging back in.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setDeactivateDialog(true)}
                                sx={{ 
                                    color: '#F57C00', 
                                    borderColor: '#F57C00',
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: '#E65100',
                                        bgcolor: '#FFF3E0'
                                    }
                                }}
                            >
                                Deactivate Account
                            </Button>
                        </Box>

                        {/* Delete Account */}
                        <Box sx={{ 
                            p: 2, 
                            border: '1px solid #EF5350', 
                            borderRadius: 1,
                            bgcolor: '#FFEBEE'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DeleteForever sx={{ color: '#D32F2F', mr: 1 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Delete Account
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setDeleteDialog(true)}
                                sx={{ 
                                    color: '#D32F2F', 
                                    borderColor: '#D32F2F',
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: '#B71C1C',
                                        bgcolor: '#FFEBEE'
                                    }
                                }}
                            >
                                Delete Account
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Deactivate Account Dialog */}
            <Dialog
                open={deactivateDialog}
                onClose={() => {
                    setDeactivateDialog(false);
                    setConfirmPassword('');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Deactivate Account
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Are you sure you want to deactivate your account? You can reactivate it by logging back in.
                    </DialogContentText>
                    <TextField
                        label="Enter your password to confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        variant="outlined"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setDeactivateDialog(false);
                            setConfirmPassword('');
                        }}
                        sx={{ 
                            color: '#666',
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeactivateAccount}
                        disabled={!confirmPassword}
                        variant="contained"
                        sx={{
                            bgcolor: '#F57C00',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#E65100' }
                        }}
                    >
                        Deactivate Account
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog
                open={deleteDialog}
                onClose={() => {
                    setDeleteDialog(false);
                    setConfirmPassword('');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600, color: '#D32F2F' }}>
                    Delete Account Permanently
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2, color: '#000' }}>
                        <strong>Warning:</strong> This action is permanent and cannot be undone. All your data, listings, and bookings will be permanently deleted.
                    </DialogContentText>
                    <TextField
                        label="Enter your password to confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        variant="outlined"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setDeleteDialog(false);
                            setConfirmPassword('');
                        }}
                        sx={{ 
                            color: '#666',
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteAccount}
                        disabled={!confirmPassword}
                        variant="contained"
                        sx={{
                            bgcolor: '#D32F2F',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#B71C1C' }
                        }}
                    >
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
