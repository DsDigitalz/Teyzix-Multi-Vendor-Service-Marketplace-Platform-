import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchProviderProfile,
  fetchListings,
  fetchProviderReviews,
} from "../api/services";
import { formatNaira, formatDate } from "../utils/constants";
import StarRating from "../components/ui/StarRating";
import ServiceCard from "../components/ServiceCard";
import EmptyState from "../components/ui/EmptyState";

const TABS = ["Services", "Reviews", "Portfolio", "Experience"];

export default function ProviderProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Services");

  useEffect(() => {
    (async () => {
      try {
        const [p, l, r] = await Promise.all([
          fetchProviderProfile(userId),
          fetchListings({ provider: userId, limit: 6 }),
          fetchProviderReviews(userId),
        ]);
        setProfile(p.data.profile);
        // // Filter client-side until you add ?provider= param to backend
        // setListings(
        //   l.data.listings.filter(
        //     (x) => x.provider?._id === userId || x.provider === userId,
        //   ),
        // );
        setReviews(r.data.reviews);
      } catch {
        navigate("/services");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="flex gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const {
    user,
    bio,
    skills,
    experience,
    portfolio,
    averageRating,
    totalReviews,
    pricing,
    isAvailable,
  } = profile;

  const avatar = profile.profilePic || user?.profilePic;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ── Profile header card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={user?.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600
                              flex items-center justify-center"
              >
                <span className="text-white font-bold text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {user?.name}
                </h1>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  isAvailable
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isAvailable ? "✓ Available" : "Unavailable"}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StarRating rating={averageRating} size="md" />
              <span className="text-sm text-gray-500">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </span>
            </div>

            {bio && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-prose">
                {bio}
              </p>
            )}

            {skills?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                px-4 pb-3 pt-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${
                  tab === t
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {t}
              {t === "Services" && ` (${listings.length})`}
              {t === "Reviews" && ` (${totalReviews})`}
              {t === "Portfolio" && ` (${portfolio?.length || 0})`}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab panels ── */}

      {tab === "Services" &&
        (listings.length === 0 ? (
          <EmptyState icon="💼" title="No services listed yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {listings.map((l) => (
              <ServiceCard key={l._id} listing={l} />
            ))}
          </div>
        ))}

      {tab === "Reviews" &&
        (reviews.length === 0 ? (
          <EmptyState
            icon="⭐"
            title="No reviews yet"
            description="Reviews appear after project delivery"
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 text-sm font-semibold">
                        {r.customer?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.customer?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size="sm" showValue={false} />
                </div>
                {r.feedback && (
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {r.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}

      {tab === "Portfolio" &&
        (!portfolio?.length ? (
          <EmptyState icon="🖼️" title="No portfolio items yet" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {portfolio.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      View project
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

      {tab === "Experience" &&
        (!experience?.length ? (
          <EmptyState icon="💼" title="No experience added yet" />
        ) : (
          <div className="space-y-4">
            {experience.map((exp) => (
              <div
                key={exp._id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                    <p className="text-sm text-blue-600 font-medium">
                      {exp.company}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    {exp.startYear} — {exp.endYear ?? "Present"}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}

      {/* ── Pricing packages ── */}
      {pricing?.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Pricing Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pricing.map((tier) => (
              <div
                key={tier._id}
                className={`rounded-xl border p-5 ${
                  tier.tier === "standard"
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-gray-200 bg-white"
                }`}
              >
                {tier.tier === "standard" && (
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Most Popular
                  </span>
                )}
                <p className="font-semibold text-gray-900 capitalize mt-1">
                  {tier.tier}
                </p>
                {tier.label && (
                  <p className="text-xs text-gray-500">{tier.label}</p>
                )}
                <p className="text-2xl font-bold text-gray-900 mt-3">
                  {formatNaira(tier.price)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {tier.deliveryDays} days delivery
                </p>
                {tier.description && (
                  <p className="text-xs text-gray-600 mt-3 leading-relaxed border-t border-gray-200 pt-3">
                    {tier.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
