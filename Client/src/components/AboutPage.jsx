import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
    const navigate = useNavigate();
    return (
        <section className="container-fluid text-light p-0 dashboard-bg vh-auto d-flex flex-column">
            <section className="container-fluid sticky-top d-flex justify-content-between text-light bg-dark">
                <h3 className="p-2">Group Music</h3>
                <div>
                    <button className="btn btn-primary p-1 mt-2" onClick={()=>navigate('/dashboard')}>
                        {" "}
                        <FaHome /> Home
                    </button>
                </div>
            </section>
            <section className="p-3">
                <h2>About Our Platform</h2>
                <h5>Listen Together. Stay in Sync</h5>
                <p>
                    Our platform is a{" "}
                    <b>real-time group music listening experience </b>designed
                    to bring friends and family together—no matter where they
                    are. It allows multiple users to listen to music in perfect
                    sync, with one shared control system that keeps everyone on
                    the same beat. Built using{" "}
                    <b>
                        {" "}
                        MERN Stack (MongoDB, Express, React, Node.js) and
                        WebSockets{" "}
                    </b>
                    , app delivers instant real-time communication and shared playback control. To maintain a smooth and consistent user experience across the application, <b> React Context API </b> is used for centralized state management.
                </p>
                <br />
                <h3>How It Works</h3>
                <p>The platform follows a simple and intuitive flow:</p>

                <h5>🔐 Secure Authentication</h5>
                <p>
                    Users can sign up and log in using{" "}
                    <b> OTP-based authentication</b>, ensuring a secure and
                    smooth onboarding experience without password complexity.
                </p>

                <h5>🧭 Dashboard</h5>
                <p>
                    After logging in, users land on a dashboard with two
                    options:
                    <ul>
                        <li>Create a Room </li>
                        <li>Join a Room</li>
                    </ul>
                </p>
                <h5>🏠 Create or Join a Room</h5>
                <ul>
                    <li>Create Room:</li>
                    <p>
                        Enter a room name and password. A{" "}
                        <b> unique room ID </b>is automatically generated.
                    </p>
                    <li>Join Room:</li>
                    <p>
                        Enter the shared room ID and password to join an
                        existing session.
                    </p>
                </ul>
                <p>
                    The room ID can be shared with friends and family, allowing
                    everyone to join the same listening session instantly.
                </p>
                <br />

                <h3>Real-Time Music Experience</h3>
                <p>
                    Once inside a room, users are taken to the{" "}
                    <b> Music Dashboard</b>, which is divided into three main
                    components:
                </p>
                <h5>🎧 Room Information Panel</h5>
                <p>Displays essential room details such as:</p>
                <ul>
                    <li>Room name </li>
                    <li>Room ID</li>
                    <li>Host information</li>
                    <li>Active participants</li>
                </ul>

                <h5>⏯️ Music Controls</h5>
                <p>
                    All music playback is <b> cloud-controlled </b>and
                    synchronized for every user in the room:
                </p>
                <ul>
                    <li>Play / Pause</li>
                    <li>Next / Previous track</li>
                    <li>Seek slider for real-time progress control</li>
                </ul>
                <p>
                    Any action performed by the host is instantly reflected for
                    all listeners, ensuring a truly shared experience.
                </p>
                <h5>🎵 Shared Playlist</h5>
                <p>
                    A collaborative playlist where{" "}
                    <b> all users can add songs</b>. The playlist updates in
                    real time, allowing everyone in the group to contribute to
                    the music queue.
                </p>

                <br />

                <h3>State Management</h3>
                <p>The application uses <b> React Context API</b> to manage global states such as:</p>
               <ul>
                <li>Authentication and user session</li>
              <li>Room and host information</li>
              <li>Music playback status</li>
              <li>Playlist and synchronization data</li>
              
               </ul>
               <p>
               This approach ensures clean data flow, avoids prop drilling, and keeps the application scalable and maintainable.
               </p>
               <br />
               
                <h3>Key Features</h3>
                <ul>
                    <li>✅ Real-time synchronized music playback</li>
                    <li>✅ WebSocket-powered instant updates</li>
                    <li>✅ OTP-based authentication</li>
                    <li>✅ Room-based listening with secure access</li>
                    <li>✅ Cloud-controlled playback actions</li>
                    <li>✅ Collaborative group playlist</li>
                    <li>✅ Built with modern MERN architecture</li>
                </ul>
                <br />
                <h3>Our Vision</h3>
                <p>
                    This project was created with one goal in mind:
                    <b>to make music a shared experience again</b>. Whether
                    you’re hanging out with friends, spending time with family,
                    or hosting a virtual music session, this platform lets
                    everyone listen together—no delays, no mismatches, just pure
                    sync.
                </p>
                <br />
            </section>
        </section>
    );
};

export default AboutPage;
