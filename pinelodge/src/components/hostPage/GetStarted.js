import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../elements/BaguioPinelodgelogo.png';
import logoCursor from '../../elements/logoCursor.png';
import { auth, db } from '../firebase';
import ProfileMenu from './ProfileMenu';
import { Box, Button, Typography, Card, CardContent, Container, Grid, Divider, Checkbox, FormControlLabel, Modal } from '@mui/material';
import { updateDoc, doc } from 'firebase/firestore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import SavingsIcon from '@mui/icons-material/Savings';
import HomeIcon from '@mui/icons-material/Home';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import PaymentIcon from '@mui/icons-material/Payment';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

export default function GetStarted() {
  const [userEmail, setUserEmail] = React.useState('');
  const [step, setStep] = React.useState(1);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [openSuccessModal, setOpenSuccessModal] = React.useState(false);
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
    if (paypal.current && !paypal.current.hasChildNodes()) {
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
            console.log('Payment successful, opening modal...');
            const user = auth.currentUser;
            if (user) {
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, { isNewUser: false });
            }
            setOpenSuccessModal(true);
            console.log('Modal state set to true');
          },
          onError: (err) => {
            console.log(err);
            alert('Payment Failed! Please try again.');
          },
        })
        .render(paypal.current);
    }
  }, []);

  const handleGetStarted = () => {
    // Scroll to subscription section
    const subscriptionSection = document.getElementById('subscription-section');
    if (subscriptionSection) {
      subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleLearnMore = () => {
    // Scroll to "What is hosting" section
    const whatIsHostingSection = document.getElementById('what-is-hosting-section');
    if (whatIsHostingSection) {
      whatIsHostingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleProceed = () => navigate('/hostPage/HomeHost');

  React.useEffect(() => {
    console.log('Modal open state:', openSuccessModal);
  }, [openSuccessModal]);

  return (
    <Box sx={{ overflowX: 'hidden', width: '100%', minHeight: '100vh' }}>
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
                  onClick={handleLearnMore}
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
            id="what-is-hosting-section"
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
                  py: 14,
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
                  mt: -8,
                  zIndex: 3,
                  pb: 8,
                  overflowX: 'hidden',
                }}
              >
                <Grid
                  container
                  spacing={6}
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
                        height: '80%',
                        maxWidth: 300,
                        mx: 'auto',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: '#E3F2FD',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <PeopleIcon sx={{ color: '#4FC3F7', fontSize: 24 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1C1C1C',
                            fontSize: '16px',
                          }}
                        >
                          Welcome Guests
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: '#757575', fontSize: '13px', lineHeight: 1.6, ml: 7 }}
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
                        height: '80%',
                        maxWidth: 300,
                        mx: 'auto',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: '#E8F5E9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <AttachMoneyIcon sx={{ color: '#66BB6A', fontSize: 24 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1C1C1C',
                            fontSize: '16px',
                          }}
                        >
                          Set Your Price
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: '#757575', fontSize: '13px', lineHeight: 1.6, ml: 7 }}
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
                        height: '80%',
                        maxWidth: 300,
                        mx: 'auto',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            backgroundColor: '#E3F2FD',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <HomeIcon sx={{ color: '#4FC3F7', fontSize: 24 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: '#1C1C1C',
                            fontSize: '16px',
                          }}
                        >
                          List Your Space
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: '#757575', fontSize: '13px', lineHeight: 1.6, ml: 7 }}
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
              py: 12,
              px: 3,
              backgroundColor: '#fff',
            }}
          >
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#30410D',
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
                  mb: 12,
                  fontSize: '16px',
                  lineHeight: 1.6,
                }}
              >
                Our platform makes it simple to manage bookings and get paid securely.
              </Typography>

              {/* Steps aligned horizontally */}
              <Grid
                container
                spacing={4}
                justifyContent="center"
                alignItems="stretch"
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' }, // hides scrollbar
                }}
              >
                {/* Step Template */}
                {[
                  {
                    number: 1,
                    title: 'Create your Listing',
                    text: 'Add photos, description, amenities, and set your listing rules.',
                    color: '#DE7001',
                  },
                  {
                    number: 2,
                    title: 'Receive Bookings',
                    text: 'Guests discover your listing and send booking requests.',
                    color: '#1C1C1C',
                  },
                  {
                    number: 3,
                    title: 'Host Your Guests',
                    text: 'Welcome guests and provide them with a great experience.',
                    color: '#DE7001',
                  },
                  {
                    number: 4,
                    title: 'Get Paid',
                    text: 'Receive secure payments directly to your account.',
                    color: '#1C1C1C',
                  },
                ].map((step, index) => (
                  <Grid
                    item
                    key={index}
                    xs={12}
                    sm={6}
                    md={3}
                    sx={{
                      flex: '1 1 25%',
                      minWidth: 250, // ensures even spacing
                      textAlign: 'center',
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          backgroundColor: step.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: '#fff', fontWeight: 700 }}
                        >
                          {step.number}
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
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#757575',
                          fontSize: '14px',
                          lineHeight: 1.6,
                        }}
                      >
                        {step.text}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>


          {/* Section 4: Safety and Support */}
          <Box
            sx={{
              py: 8,
              px: 3,
              position: 'relative',
              backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(230, 230, 230, 0.92)',
                zIndex: 0,
              },
            }}
          >
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: '#30410D',
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
                  mb: 5,
                  fontSize: '16px',
                  lineHeight: 1.6,
                  maxWidth: 700,
                  mx: 'auto',
                }}
              >
                We're here to help you succeed as a host with comprehensive support and protection.
              </Typography>

              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  backgroundColor: '#fff',
                }}
              >
                {/* Secure Payments */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: 'rgba(112, 135, 63, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <PaymentIcon sx={{ color: '#70873F', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1C1C1C',
                        mb: 0.5,
                        fontSize: '18px',
                      }}
                    >
                      Secure Payments
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B6B6B',
                        fontSize: '14px',
                        lineHeight: 1.7,
                      }}
                    >
                      All payments are processed securely through the platform, protecting you from fraud and ensuring your earnings are safely deposited after every stay.
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Safety Guidelines */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: 'rgba(222, 112, 1, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CleaningServicesIcon sx={{ color: '#DE7001', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1C1C1C',
                        mb: 0.5,
                        fontSize: '18px',
                      }}
                    >
                      Safety Guidelines
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B6B6B',
                        fontSize: '14px',
                        lineHeight: 1.7,
                      }}
                    >
                      All payments are processed securely through the platform, protecting you from fraud and ensuring your earnings are safely deposited after every stay.
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* 24/7 Support */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      backgroundColor: 'rgba(48, 65, 13, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SupportAgentIcon sx={{ color: '#30410D', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1C1C1C',
                        mb: 0.5,
                        fontSize: '18px',
                      }}
                    >
                      24/7 Support
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6B6B6B',
                        fontSize: '14px',
                        lineHeight: 1.7,
                      }}
                    >
                      All payments are processed securely through the platform, protecting you from fraud and ensuring your earnings are safely deposited after every stay.
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Container>
          </Box>

          {/* Section 5: Ready to start hosting? */}
          <Box
            id="subscription-section"
            sx={{
              py: 12,
              px: 3,
              textAlign: 'center',
              backgroundColor: '#fff',
            }}
          >
            <Container maxWidth="md">
              <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: '#30410D',
                    mb: 2,
                    fontSize: { xs: '28px', md: '36px' },
                  }}
                >
                  Start your hosting journey today
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#6B6B6B',
                    fontSize: '16px',
                    lineHeight: 1.6,
                  }}
                >
                  Get full access to all hosting features with our 3 month subscription plan.
                </Typography>
              </Box>

              <Card
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff',
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#1C1C1C',
                    textAlign: 'center',
                    mb: 1.5,
                    fontSize: { xs: '20px', md: '24px' },
                  }}
                >
                  3 Month Subscription Plan
                </Typography>
                
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: '32px', md: '36px' },
                      fontWeight: 700,
                      color: '#DE7001',
                    }}
                  >
                    ₱3,000
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '16px',
                      color: '#757575',
                      ml: 1,
                    }}
                  >
                    / quarterly
                  </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1C1C1C',
                    mb: 2,
                    textAlign: 'left',
                    fontSize: '16px',
                  }}
                >
                  What's included:
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {[
                    'Unlimited property listings',
                    'Advanced booking management tools',
                    'Priority 24/7 customer support',
                    'Comprehensive analytics dashboard',
                    'Host protection insurance up to $1M',
                    'Verified guest screening',
                    '2% platform fee on all bookings',
                    'Marketing tools and promotion features',
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        mb: 1.5,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          color: '#70873F',
                          fontSize: 20,
                          mr: 1.5,
                          mt: 0.2,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#4A4A4A',
                          fontSize: '14px',
                          lineHeight: 1.6,
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box 
                  sx={{ 
                    mb: 2,
                    p: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: agreedToTerms ? '#70873F' : '#e0e0e0',
                    backgroundColor: agreedToTerms ? 'rgba(112, 135, 63, 0.05)' : '#fafafa',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box display="flex" alignItems="flex-start">
                    <Checkbox
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      sx={{
                        mt: -1,
                        '& .MuiSvgIcon-root': { fontSize: 22 },
                        color: '#70873F',
                        '&.Mui-checked': { color: '#70873F' }
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontSize: '13px', 
                        lineHeight: 2,
                        color: '#333'
                      }}
                    >
                      I agree to the{' '}
                      <Box
                        component="span"
                        sx={{
                          color: "#70873F",
                          cursor: "pointer",
                          fontWeight: 600,
                          textDecoration: 'underline',
                          textDecorationColor: 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            textDecorationColor: '#70873F',
                            color: '#30410D'
                          }
                        }}
                      >
                        Terms of Service
                      </Box>
                      {' '}and{' '}
                      <Box
                        component="span"
                        sx={{
                          color: "#70873F",
                          cursor: "pointer",
                          fontWeight: 600,
                          textDecoration: 'underline',
                          textDecorationColor: 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            textDecorationColor: '#70873F',
                            color: '#30410D'
                          }
                        }}
                      >
                        Privacy Policy
                      </Box>
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div ref={paypal}></div>
                </Box>
              </Card>
            </Container>
          </Box>
        </Box>
      )}

      {/* Success Modal */}
      <Modal
        open={openSuccessModal}
        onClose={() => {}}
        aria-labelledby="success-modal-title"
        aria-describedby="success-modal-description"
        disableEscapeKeyDown
        sx={{ zIndex: 9999 }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            outline: 'none',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(112, 135, 63, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircleIcon sx={{ color: '#70873F', fontSize: 50 }} />
          </Box>
          
          <Typography
            id="success-modal-title"
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#30410D',
              mb: 2,
              fontSize: { xs: '24px', md: '28px' },
            }}
          >
            Welcome to the PineLodge Host Family!
          </Typography>
          
          <Typography
            id="success-modal-description"
            variant="body1"
            sx={{
              color: '#6B6B6B',
              mb: 4,
              fontSize: '16px',
              lineHeight: 1.6,
            }}
          >
            Your host account is now active. Begin listing your cozy Baguio
            stays and start welcoming guests.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{
              backgroundColor: '#DE7001',
              color: '#fff',
              py: 1.5,
              borderRadius: 2,
              fontSize: '16px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#C55F01' },
            }}
            onClick={handleProceed}
          >
            Proceed to Listing
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
