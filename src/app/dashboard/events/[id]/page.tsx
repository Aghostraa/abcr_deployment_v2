'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Calendar, Globe, Lock, ExternalLink, Users, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Define the structure of an Event object
interface Event {
  id: string;
  name: string;
  description: string;
  event_date: string;
  attendees: string[];
  status: 'upcoming' | 'ongoing' | 'past';
  event_link: string;
  event_type: 'Internal' | 'Public';
}

// Main component for displaying event details
const EventDetailsPage = ({ params }: { params: { id: string } }) => {
  // Get the current user from context
  const { user } = useUser();

  // State to hold event data
  const [event, setEvent] = useState<Event | null>(null);

  // State to manage loading state
  const [loading, setLoading] = useState(true);

  // Initialize Supabase client
  const supabase = createClientComponentClient();

  // Effect to fetch event data when user or event ID changes
  useEffect(() => {
    // Only fetch event if user is authenticated and has the right role
    if (user && ['Admin', 'Manager'].includes(user.role)) {
      fetchEvent();
    }
  }, [user, params.id]);

  // Function to fetch event details from Supabase
  const fetchEvent = async () => {
    setLoading(true); // Start loading

    // Query the 'events' table for the specific event ID
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single(); // Expecting a single record

    if (eventError) {
      // Log any errors encountered during fetch
      console.error('Error fetching event:', eventError);
      setLoading(false);
      return;
    }

    // Set the fetched event data to state
    setEvent(eventData);
    setLoading(false); // Loading complete
  };

  // Function to download the QR code as a PNG image
  const downloadQRCode = () => {
    const svgElement = document.getElementById('qr-code');
    if (svgElement) {
      // Serialize the SVG element to a string
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      // Create an image from the SVG blob
      const img = new Image();
      img.onload = () => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0); // Draw the image on the canvas
        
        // Convert the canvas to a PNG blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a temporary download link
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `event_qr_${event?.id}.png`; // Filename includes event ID
            document.body.appendChild(downloadLink);
            downloadLink.click(); // Trigger download
            document.body.removeChild(downloadLink); // Clean up
            URL.revokeObjectURL(url); // Release the object URL
          }
        }, 'image/png');
      };
      img.src = URL.createObjectURL(svgBlob); // Set image source to SVG blob
    }
  };

  // If user is not authenticated or doesn't have the required role, show permission message
  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    return (
      <DashboardLayout>
        <div>You do not have permission to view this page.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial animation state
        animate={{ opacity: 1, y: 0 }} // Final animation state
        transition={{ duration: 0.5 }} // Animation duration
        className="space-y-6"
      >
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Event Details
        </h1>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-4">Loading event details...</div>
        ) : event ? (
          <>
            {/* Event Information Section */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }} // Hover animation
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Event Name */}
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">{event.name}</h2>

              {/* Event Description */}
              <p className="text-gray-300 mb-4">{event.description}</p>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Date */}
                <div className="flex items-center">
                  <Calendar className="mr-2 text-blue-400" size={20} />
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>

                {/* Event Type */}
                <div className="flex items-center">
                  {event.event_type === 'Internal' ? (
                    <Lock className="mr-2 text-yellow-400" size={20} />
                  ) : (
                    <Globe className="mr-2 text-green-400" size={20} />
                  )}
                  <span>{event.event_type}</span>
                </div>
              </div>

              {/* Event Link, if available */}
              {event.event_link && (
                <a
                  href={event.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-blue-400 hover:text-blue-300 flex items-center"
                >
                  Event Link <ExternalLink size={14} className="ml-1" />
                </a>
              )}
            </motion.div>

            {/* Attendees and QR Code Section */}
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }} // Hover animation
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Attendees Header */}
              <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Attendees
              </h3>

              {/* Total Number of Attendees */}
              <p className="text-gray-300 mb-4">Total Attendees: {event.attendees.length}</p>
              
              {/* QR Code Section (only if event is not past) */}
              {event.status !== 'past' && (
                <div className="mt-6">
                  {/* QR Code Header */}
                  <h4 className="text-lg font-semibold mb-2 text-purple-300">Attendance QR Code</h4>
                  
                  {/* QR Code Display */}
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <QRCodeSVG
                      id="qr-code" // ID used for downloading the QR code
                      value={`https://abcrdeploymentv2.vercel.app/attendance/${event.id}`} // QR code data
                      size={200} // Size of the QR code
                      level="H" // Error correction level
                    />
                  </div>

                  {/* Download QR Code Button */}
                  <button
                    onClick={downloadQRCode} // Trigger download on click
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <Download size={14} className="mr-2" />
                    Download QR Code
                  </button>
                </div>
              )}
            </motion.div>
          </>
        ) : (
          // If event data is not found
          <div className="text-center py-4">Event not found.</div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default EventDetailsPage;
