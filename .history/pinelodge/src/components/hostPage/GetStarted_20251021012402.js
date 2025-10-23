import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../elements/BaguioPinelodgelogo.png';
import logoCursor from '../../elements/logoCursor.png';
import { auth, db } from '../firebase';
import ProfileMenu from './ProfileMenu';
import { Box, Button, Typography, Card, CardContent, Divider } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';

export default function GetStarted() {
  const [userEmail, setUserEmail] = React.useState('');
  const [step, setStep] = React.useState(1);
  const paypal = React.useRef();
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email);
      else setUserEmail('');
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (step === 2 && paypal.current && !paypal.current.hasChildNodes()) {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'subscribe',
            height: 45,
          },
          createOrder: (data, actions) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  description: 'Baguio Pinelodge Host Subscription',
                  amount: { currency_code: 'PHP', value: 3000.0 },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            const order = await actions.order.capture();
            alert('Payment Successful! Welcome to PineLodge.');
            const user = auth.currentUser;
            if (user) {
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, { isNewUser: false });
            }
            setStep(3);
          },
          onError: (err) => {
            console.log(err);
            alert('Payment Failed! Please try again.');
          },
        })
        .render(paypal.current);
    }
  }, [step]);

  const handleGetStarted = () => setStep(2);
  const handleProceed = () => navigate('/hostPage/HomeHost');

  return (
    <Box sx={{ backgroundColor: '#ffffffff', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          backgroundColor: '#fff',
        }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img
              src={logo}
              alt="Baguio PineLodge Logo"
              style={{
                width: 54,
                height: 54,
                cursor: `url(${logoCursor}) 0 0, pointer`,
              }}
            />
          </Link>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'lighter',
                fontSize: 28,
                mb: -1,
                color: '#30410D',
                fontFamily: "'Kingred Serif', serif",
              }}
            >
              BAGUIO
            </Typography>
            <Typography
              variant="caption"
              sx={{
                letterSpacing: 3,
                fontSize: 13,
                color: '#30410D',
                fontFamily: "'Questrial', sans-serif",
              }}>
              PINELODGE
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', pr: 5 }}>
          {userEmail && <ProfileMenu userEmail={userEmail} />}
        </Box>
      </Box>
    
      {step === 1 && (
        <Box sx={{ textAlign: 'center', mt: 10 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#30410D',
              mb: 2,
            }}
          >
            Become a PineLodge Host
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Share your Baguio space with travelers seeking warmth and charm.
            Start earning and be part of a trusted host community that values
            comfort, care, and hospitality.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              backgroundColor: '#70873F',
              color: '#fff',
              px: 4,
              py: 1.2,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#5F6E32' },
            }}
          >
            Get Started
          </Button>
        </Box>
      )}

      {step === 2 && (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Card
            sx={{
              display: 'inline-block',
              p: 4,
              borderRadius: 3,
              boxShadow: 3,
              maxWidth: 400,
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: '#30410D', mb: 1 }}
              >
                Activate Your Host Account
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                A one-time ₱3,000 subscription gives you access to host tools,
                guest visibility, and exclusive PineLodge support.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <div ref={paypal}></div>
            </CardContent>
          </Card>
        </Box>
      )}

      {step === 3 && (
        <Box sx={{ textAlign: 'center', mt: 12 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#30410D',
              mb: 2,
              fontFamily: "'Kingred Serif', serif",
            }}
          >
            Welcome to the Pine Lodge Family!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Your host account is now active. Begin listing your cozy Baguio
            stays and start welcoming guests.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#DE7001',
              color: '#fff',
              px: 4,
              py: 1.2,
              borderRadius: 2,
              '&:hover': { backgroundColor: '#DE7001' },
            }}
            onClick={handleProceed}
          >
            Proceed to Listing
          </Button>
        </Box>
      )}
    </Box>
  );
}
