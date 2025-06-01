import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/AuthContext";
import Calendar from "react-calendar";

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleDate = (newDate) => {
    const date = new Date(newDate);
    date.setHours(0, 0, 0, 0);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const formattedDate = utcDate.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
    console.log("Selected date:", formattedDate);
  };

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("FoodDetails")
        .select("*")
        .eq("id", user.id)
        .eq("created_at", selectedDate) // Fetch today's history
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
      } else {
        console.log("History data:", data);
        setHistoryData(data);
      }
    })();

    console.log("Fetching history data...");
  }, [selectedDate, user.id]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "20px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <Calendar onChange={handleDate} value={selectedDate} />
        <br />
        <h3 style={{ textAlign: "center" }}>
          Fetching Data for : {selectedDate}
        </h3>
      </div>
      <hr />
      {historyData.length > 0 ? (
        <div>
          <h2>Your Food Analysis History - Total {historyData.length}</h2>
          <ul
            style={{
              listStyleType: "none",
              padding: "70px",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              marginTop: "-60px",
            }}
          >
            {historyData.map((item, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "10px",
                  marginTop: "10px",
                  border: "1px solid #ccc",
                  padding: "20px",
                  borderRadius: "10px",
                  backgroundColor: "#f9f9f9",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "49%",
                  boxSizing: "border-box",
                }}
              >
                <img
                  src={item.imagelink}
                  alt={item.ItemName}
                  width={150}
                  height={150}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "https://via.placeholder.com/100"; // Fallback image
                  }}
                />

                <div
                  style={{
                    marginTop: "10px",
                    marginLeft: "30px",
                    fontSize: "1.2rem",
                    borderLeft: "2px dashed black",
                    paddingLeft: "20px",
                    flex: 1,
                  }}
                >
                  <p>
                    <strong>Item Name:</strong> {item.ItemName}
                  </p>
                  <p>
                    <strong>Health Label:</strong> {item.health_label}
                  </p>
                  <p>
                    <strong>Uploaded On:</strong>{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Uploaded By:</strong>{" "}
                    {user?.user_metadata?.name || "User"}
                  </p>
                  <p>
                    <strong>Calories:</strong> {item.nutrientdetail.calories}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>No history found</h2>
          <p>It seems you haven't uploaded any food images yet.</p>
        </div>
      )}
    </div>
  );
};

export default History;
