'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@/contexts/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Calendar, Globe, Lock, ExternalLink, Users, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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

const EventDetailsPage = ({ params }: { params: { id: string } }) => {
  const { user } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user && ['Admin', 'Manager'].includes(user.role)) {
      fetchEvent();
    }
  }, [user, params.id]);

  const fetchEvent = async () => {
    setLoading(true);
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single();

    if (eventError) {
      console.error('Error fetching event:', eventError);
      setLoading(false);
      return;
    }

    setEvent(eventData);
    setLoading(false);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `event_qr_${event?.id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (!user || !['Admin', 'Manager'].includes(user.role)) {
    return <DashboardLayout><div>You do not have permission to view this page.</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Event Details
        </h1>
        {loading ? (
          <div className="text-center py-4">Loading event details...</div>
        ) : event ? (
          <>
            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">{event.name}</h2>
              <p className="text-gray-300 mb-4">{event.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="mr-2 text-blue-400" size={20} />
                  <span>{new Date(event.event_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  {event.event_type === 'Internal' ? (
                    <Lock className="mr-2 text-yellow-400" size={20} />
                  ) : (
                    <Globe className="mr-2 text-green-400" size={20} />
                  )}
                  <span>{event.event_type}</span>
                </div>
              </div>
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

            <motion.div
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Attendees
              </h3>
              <p className="text-gray-300 mb-4">Total Attendees: {event.attendees.length}</p>
              
              {event.status !== 'past' && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2 text-purple-300">Attendance QR Code</h4>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <QRCodeSVG
                      id="qr-code"
                      value={`https://abcrdeploymentv2.vercel.app/attendance/${event.id}`}
                      size={200}
                      level="H"
                    />
                  </div>
                  <button
                    onClick={downloadQRCode}
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
          <div className="text-center py-4">Event not found.</div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default EventDetailsPage;