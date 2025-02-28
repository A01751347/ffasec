import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const salesData = [
    { name: 'Jul', sales: 4200 },
    { name: 'Ago', sales: 4700 },
    { name: 'Sep', sales: 4100 },
    { name: 'Oct', sales: 5200 },
    { name: 'Nov', sales: 6300 },
    { name: 'Dec', sales: 4600 },
    { name: 'Jan', sales: 4200 },
];

const SalesOverviewChart = () => {
    return (
        <div>
            <motion.div
                className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .2 }}
            >
                <h2 className="text-lg font-medium mb-4 text-gray-100">Resúmen de ventas
                </h2>
                    <div className="h-80">
                        <ResponsiveContainer width={'100%'} height={'100%'}>
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
                                <XAxis dataKey={'name'} />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(31,41,55,0.8)',
                                        borderColor: '#4B5563'
                                    }}
                                    itemStyle={{ color: '#E5E7EB' }} />
                                <Line
                                    type='monotone'
                                    dataKey='sales'
                                    stroke='#6366F1'
                                    strokeWidth={3}
                                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r:4, strokeWidth: 2 }} />

                            </LineChart>
                        </ResponsiveContainer>
                    </div> 
            </motion.div>
        </div>
    )
}

export default SalesOverviewChart
