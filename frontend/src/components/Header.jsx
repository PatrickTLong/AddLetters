import { useEffect, useState } from "react";
import axios from "axios";

export default function Header() {
    {/* STATES */}
    const [data, setdata] = useState({ summary: "" });
    const [getdata, setgetdata] = useState([]);
    const [checked, setchecked] = useState([]);

    {/* FUNCTIONS */}
    {/* POST & GET */}
    function Submit(e) {
        console.log(checked);
        e.preventDefault();
        axios.post("http://127.0.0.1:5000/checklistdata", data)
            .then(() => {
                axios.get("http://127.0.0.1:5000/returnchecklistdata")
                    .then(response => {
                        setgetdata(response.data);
                    });
            });
        setdata(prev => ({ ...prev, summary: "" }));
    }

    {/* GET checklist data */}
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/returnchecklistdata")
            .then(response => {
                setgetdata(response.data);
            });
    }, []);

    {/* GET checklist states */}
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/returncheckliststates")
            .then(response => {
                const transformed = response.data.map(item => ({
                    location: String(item.location),
                    state: !!item.state,
                }));
                console.log("Fetched states:", transformed); // Debug log
                setchecked(transformed);
            });
    }, []);

    function ChangeData(e) {
        setdata(prev => ({ ...prev, summary: e.target.value }));
    }

    function SetState(index) {
        const location = String(index); // Ensure consistent string type
        const existing = checked.find(prev => prev.location === location);
        const userdata = { location, state: !existing?.state };

        // Update the backend
        const endpoint = existing
            ? "http://127.0.0.1:5000/checkliststates"
            : "http://127.0.0.1:5000/checkliststatesadd";
        
        axios.post(endpoint, userdata).then(() => {
            // Update the state immediately for a better UX
            setchecked(prev => {
                if (existing) {
                    // Update the state of an existing item
                    return prev.map(item =>
                        item.location === location ? { ...item, state: !item.state } : item
                    );
                } else {
                    // Add a new state item
                    return [...prev, userdata];
                }
            });
        });
    }

    return (
        <>
            {/* START */}
            {/* 1ST CONTAINER */}
            <div className="flex mt-9 p-16 mb-36 justify-center items-center gap-8 flex-col">
                {/* INPUT */}
                <p className="font-medium  text-6xl">Add a Note 😁</p>
                <input placeholder="Add a Note!"
                    value={data.summary}
                    onChange={ChangeData}
                    className="w-72 border-2 font-medium placeholder:font-medium p-2 rounded-2xl border-black"
                    type="text"
                />
                <button className="rounded-2xl outline p-3 transition-all hover:bg-emerald-400 text-white font-medium bg-emerald-300 " onClick={Submit} type="submit">
                    Submit
                </button>
                {/* Mapped Items */}
                {getdata.map((object, index) => (
                    <div key={index} className="flex gap-3 ml-96 self-start items-center">
                        <input
                            className="w-3 h-3"
                            onChange={() => SetState(index)}
                            type="checkbox"
                            checked={checked.some(
                                prev => prev.location === String(index) && prev.state === true
                            )}
                        />
                        <p
                            className={`transition-[property] duration-300  font-medium ${
                                checked.some(
                                    prev => prev.location === String(index) && prev.state === true
                                )
                                    ? "line-through"
                                    : ""
                            }`} 
                        >
                            {object.summary}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}
