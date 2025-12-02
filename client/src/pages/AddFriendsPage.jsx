import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import assets from "../assets/assets";

function AddFriendsPage() {
  const { authUser } = useContext(AuthContext);
  const {
    users,
    getUsers,
    friends,
    pendingRequests,
    sentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    deleteFriendRequest
  } = useContext(ChatContext);

  useEffect(() => {
    getUsers();
  }, []);

  const isFriend = (id) => friends.some((f) => f._id === id);
  const isPendingReceived = (id) =>
    pendingRequests.some((r) => r.from._id === id || r.from === id);
  const isPendingSent = (id) =>
    sentRequests.some((r) => r.to._id === id || r.to === id);

  const handleSend = async (id) => {
    try {
      await sendFriendRequest(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (userId) => {
    const request = pendingRequests.find(
      (r) => r.from._id === userId || r.from === userId
    );
    if (request) {
      try {
        await acceptFriendRequest(request._id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleReject = async (userId) => {
    const request = pendingRequests.find(
      (r) => r.from._id === userId || r.from === userId
    );
    if (request) {
      try {
        await deleteFriendRequest(request._id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleCancel = async (userId) => {
    const request = sentRequests.find(
      (r) => r.to._id === userId || r.to === userId
    );
    if (request) {
      try {
        await deleteFriendRequest(request._id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="relative p-6 h-screen overflow-y-auto bg-stone-950 text-stone-100">

      {/* CURSOR GLOW */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_center,rgba(251,191,36,0.12),transparent_70%)] opacity-60" />
      </div>

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* CONTENT */}
      <div className="relative z-10">

        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
          Friends
        </h1>

        {/* ========== RECEIVED REQUESTS ========== */}
        {pendingRequests.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-3 text-amber-300">Friend Requests</h2>
            <div className="flex flex-col gap-4 mb-10">
              {pendingRequests.map((req, idx) => {
                const u = req.from;
                return (
                  <UserCard
                    key={req._id}
                    user={u}
                    idx={idx}
                    actionButton={
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(u._id)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:scale-105 transition-all shadow-lg hover:shadow-green-500/20"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(u._id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:scale-105 transition-all shadow-lg hover:shadow-red-500/20"
                        >
                          Reject
                        </button>
                      </div>
                    }
                  />
                );
              })}
            </div>
          </>
        )}

        {/* ========== SENT REQUESTS ========== */}
        {sentRequests.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-3 text-amber-300">Sent Requests</h2>
            <div className="flex flex-col gap-4 mb-10">
              {sentRequests.map((req, idx) => {
                const u = req.to;
                return (
                  <UserCard
                    key={req._id}
                    user={u}
                    idx={idx}
                    actionButton={
                      <button
                        onClick={() => handleCancel(u._id)}
                        className="px-3 py-1 text-sm bg-stone-700 text-stone-300 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        Cancel
                      </button>
                    }
                  />
                );
              })}
            </div>
          </>
        )}

        {/* ========== FIND NEW FRIENDS ========== */}
        <h2 className="text-xl font-semibold mb-3 text-amber-300">Find New Friends</h2>

        <div className="flex flex-col gap-4 mb-16">
          {users.map((u, idx) => {
            if (u._id === authUser?._id) return null;
            if (isFriend(u._id)) return null;
            if (isPendingReceived(u._id)) return null;
            if (isPendingSent(u._id)) return null;

            return (
              <UserCard
                key={u._id}
                user={u}
                idx={idx}
                actionButton={
                  <button
                    onClick={() => handleSend(u._id)}
                    className="px-3 py-1 text-sm bg-gradient-to-r from-orange-500 to-amber-400 
                    text-black rounded-lg font-semibold hover:scale-105 transition-all shadow-lg hover:shadow-orange-500/20"
                  >
                    Add Friend
                  </button>
                }
              />
            );
          })}

          {users.length === 0 && (
            <p className="text-stone-400 text-sm">No other users found.</p>
          )}
        </div>

        <div className="h-20"></div>
      </div>
    </div>
  );
}

export default AddFriendsPage;

function UserCard({ user, idx, actionButton }) {
  return (
    <div
      style={{ animationDelay: `${idx * 0.05}s` }}
      className="flex items-center gap-4 p-4 rounded-xl 
      backdrop-blur-xl bg-white/5 border border-white/10 
      shadow-lg hover:bg-white/10 hover:border-amber-400/40 
      transition-all duration-300"
    >
      <img
        src={user.profilePic || assets.avatar_icon}
        className="h-12 w-12 rounded-full object-cover border border-white/20"
      />

      <div className="flex-1">
        <p className="font-semibold text-white">{user.fullname}</p>
        <p className="text-xs text-stone-400">{user.bio || "Hey there 👋"}</p>
      </div>

      {actionButton}
    </div>
  );
}
