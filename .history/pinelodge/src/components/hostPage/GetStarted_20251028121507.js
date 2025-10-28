import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../elements/BaguioPinelodgelogo.png';
import logoCursor from '../../elements/logoCursor.png';
import { auth, db } from '../firebase';
import ProfileMenu from './ProfileMenu';
import { Box, Button, Typography, Card, CardContent, Container, Grid, Divider } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import SavingsIcon from '@mui/icons-material/Savings';
import HomeIcon from '@mui/icons-material/Home';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';

export default function GetStarted() {
  const [userEmail, setUserEmail] = React.useState('');
  const [step, setStep] = React.useState(1);
  const paypal = React.useRef();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

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
          <Link to="" style={{ textDecoration: 'none' }}>
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
        <Box>
          {/* Section 1: Hero */}
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              backgroundColor: '#fff',
            }}
          >
            <Container maxWidth="md">
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#70873F',
                  color: '#fff',
                  px: 3,
                  py: 0.8,
                  borderRadius: 20,
                  mb: 4,
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: '#5F6E32' },
                }}
              >
                Start earning today
              </Button>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: '#1C1C1C',
                  mb: 3,
                  fontSize: { xs: '32px', md: '42px' },
                }}
              >
                Become a Pinelodge Host
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#6B6B6B',
                  mb: 5,
                  fontSize: '16px',
                  lineHeight: 1.6,
                }}
              >
                Share your Baguio space with travelers seeking warmth and charm.
                Start earning and be part of a trusted host community that values
                comfort, care, and hospitality.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    backgroundColor: '#30410D',
                    color: '#fff',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#1C1C1C' },
                  }}
                >
                  Get Started
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#30410D',
                    color: '#30410D',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#1C1C1C',
                      backgroundColor: 'rgba(48, 65, 13, 0.04)'
                    },
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Container>
          </Box>

          {/* What is hosting section */}
          <Box
            sx={{
              mt: 8,
              width: '100%',
              position: 'relative',
            }}
          >
            {/* What is hosting section */}
            <Box
              sx={{
                mt: 8,
                width: '100vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw',
                overflowX: 'hidden', 
              }}
            >
              {/* Green background with image overlay */}
              <Box
                sx={{
                  width: '100%',
                  backgroundColor: '#70873F',
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'multiply',
                  py: 8,
                  px: { xs: 2, md: 4 },
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(112, 135, 63, 0.85)',
                    zIndex: 1,
                  },
                }}
              >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#fff',
                      textAlign: 'center',
                      mb: 2,
                      fontSize: { xs: '28px', md: '34px' },
                    }}
                  >
                    What is hosting?
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#f9f9f9',
                      textAlign: 'center',
                      mb: 0,
                      maxWidth: 700,
                      mx: 'auto',
                      fontSize: '16px',
                      lineHeight: 1.6,
                    }}
                  >
                    Hosting means opening your property to guests and providing them with a
                    memorable stay experience.
                  </Typography>
                </Container>
              </Box>

              {/* Cards overlapping the green section */}
              <Container
                maxWidth="lg"
                sx={{
                  position: 'relative',
                  mt: -7,
                  zIndex: 3,
                  pb: 8,
                  overflowX: 'hidden',
                }}
              >
                <Grid
                  container
                  spacing={3}
                  justifyContent="center"
                  alignItems="stretch"
                  sx={{ flexWrap: 'wrap' }}
                >
                  {/* Card 1 */}
                  <Grid item xs={12} sm={6} md={3.5}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        height: '100%',
                        maxWidth: 300,
                        mx: 'auto',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          backgroundColor: '#E3F2FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <PeopleIcon sx={{ color: '#4FC3F7', fontSize: 24 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#1C1C1C',
                          mb: 1.5,
                          fontSize: '16px',
                        }}
                      >
                        Welcome Guests
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#757575', fontSize: '13px', lineHeight: 1.6 }}
                      >
                        Accept bookings, communicate with guests, and provide an exceptional
                        experience.
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Card 2 */}
                  <Grid item xs={12} sm={6} md={3.5}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        height: '100%',
                        maxWidth: 300,
                        mx: 'auto',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          backgroundColor: '#E8F5E9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <AttachMoneyIcon sx={{ color: '#66BB6A', fontSize: 24 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#1C1C1C',
                          mb: 1.5,
                          fontSize: '16px',
                        }}
                      >
                        Set Your Price
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#757575', fontSize: '13px', lineHeight: 1.6 }}
                      >
                        You control your pricing and availability. Adjust rates based on
                        seasons and demand.
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Card 3 */}
                  <Grid item xs={12} sm={6} md={3.5}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        height: '100%',
                        maxWidth: 300,
                        mx: 'auto',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          backgroundColor: '#E3F2FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <HomeIcon sx={{ color: '#4FC3F7', fontSize: 24 }} />
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#1C1C1C',
                          mb: 1.5,
                          fontSize: '16px',
                        }}
                      >
                        List Your Space
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#757575', fontSize: '13px', lineHeight: 1.6 }}
                      >
                        Share your entire home, a private room, or even a unique space like
                        a treehouse or boat.
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Container>
            </Box>

          </Box>

          {/* Section 3: How the booking system works */}
          <Box
            sx={{
              py: 8,
              px: 3,
              backgroundColor: '#fff',
            }}
          >
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#1C1C1C',
                  textAlign: 'center',
                  mb: 2,
                  fontSize: { xs: '28px', md: '36px' },
                }}
              >
                How the booking system works
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6B6B6B',
                  textAlign: 'center',
                  mb: 6,
                  fontSize: '16px',
                  lineHeight: 1.6,
                }}
              >
                Our platform makes it simple to manage bookings and get paid securely.
              </Typography>

              <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
                {/* Step 1 */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#DE7001',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ color: '#fff', fontWeight: 700 }}
                      >
                        1
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1C1C1C',
                        mb: 1.5,
                        fontSize: '18px',
                      }}
                    >
                      Create your Listing
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#757575',
                        fontSize: '14px',
                        lineHeight: 1.6,
                      }}
                    >
                      Add photos, description, amenities, and set your listing rules
                    </Typography>
                  </Box>
                </Grid>

                {/* Step 2 */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#1C1C1C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ color: '#fff', fontWeight: 700 }}
                      >
                        2
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1C1C1C',
                        mb: 1.5,
                        fontSize: '18px',
                      }}
                    >
                      Receive Bookings
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#757575',
                        fontSize: '14px',
                        lineHeight: 1.6,
                      }}
                    >
                      Guests discover your listing and send booking requests
                    </Typography>
                  </Box>
                </Grid>

                {/* Step 3 */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#DE7001',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ color: '#fff', fontWeight: 700 }}
                      >
                        3
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1C1C1C',
                        mb: 1.5,
                        fontSize: '18px',
                      }}
                    >
                      Host Your Guests
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#757575',
                        fontSize: '14px',
                        lineHeight: 1.6,
                      }}
                    >
                      Welcome guests and provide them with a great experience
                    </Typography>
                  </Box>
                </Grid>

                {/* Step 4 */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#1C1C1C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ color: '#fff', fontWeight: 700 }}
                      >
                        4
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1C1C1C',
                        mb: 1.5,
                        fontSize: '18px',
                      }}
                    >
                      Get Paid
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#757575',
                        fontSize: '14px',
                        lineHeight: 1.6,
                      }}
                    >
                      Receive secure payments directly to your account
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Section 4: Safety and Support */}
          <Box
            sx={{
              py: 8,
              px: 3,
              backgroundColor: '#f5f5f5',
            }}
          >
            <Container maxWidth="md">
              <Card
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  backgroundColor: '#fff',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#1C1C1C',
                    textAlign: 'center',
                    mb: 2,
                    fontSize: { xs: '28px', md: '36px' },
                  }}
                >
                  Safety and Support
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6B6B6B',
                    textAlign: 'center',
                    mb: 4,
                    fontSize: '16px',
                    lineHeight: 1.6,
                  }}
                >
                  We're here to help you succeed as a host with comprehensive support and protection.
                </Typography>

                <Box sx={{ textAlign: 'left', maxWidth: 800, mx: 'auto' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#4A4A4A',
                      mb: 3,
                      fontSize: '15px',
                      lineHeight: 1.8,
                    }}
                  >
                    All payments are processed securely through the platform, protecting you from fraud and ensuring your earnings are safely deposited after every stay.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#4A4A4A',
                      mb: 3,
                      fontSize: '15px',
                      lineHeight: 1.8,
                    }}
                  >
                    We provide cleanliness and safety guidelines to help you prepare your space to the highest standards — ensuring every guest enjoys a safe and pleasant stay.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#4A4A4A',
                      fontSize: '15px',
                      lineHeight: 1.8,
                    }}
                  >
                    Our dedicated support team is available anytime, day or night, to help with bookings, safety concerns, or hosting questions.
                  </Typography>
                </Box>
              </Card>
            </Container>
          </Box>

          {/* Section 5: Ready to start hosting? */}
          <Box
            sx={{
              py: 8,
              px: 3,
              textAlign: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Container maxWidth="md">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#1C1C1C',
                  mb: 4,
                  fontSize: { xs: '28px', md: '36px' },
                }}
              >
                Ready to start hosting?
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  backgroundColor: '#30410D',
                  color: '#fff',
                  px: 5,
                  py: 1.8,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '18px',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#1C1C1C' },
                }}
              >
                Continue to Subscription
              </Button>
            </Container>
          </Box>
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
                A yearly ₱3,000 subscription gives you access to host tools,
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
            }}
          >
            Welcome to the PineLodge Host Family!
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
